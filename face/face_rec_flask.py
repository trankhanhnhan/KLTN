from flask import Flask, Response, send_file, jsonify
from flask_cors import CORS
import cv2
import imutils
import numpy as np
from imutils.video import VideoStream
import align.detect_face
import tensorflow as tf
import pickle
import base64
import csv
from datetime import datetime, timedelta
import os
import threading

app = Flask(__name__, static_folder='static')
CORS(app)

MINSIZE = 20
THRESHOLD = [0.6, 0.7, 0.7]
FACTOR = 0.709
INPUT_IMAGE_SIZE = 160
CLASSIFIER_PATH = 'Models/facemodel.pkl'
FACENET_MODEL_PATH = 'Models/20180402-114759.pb'

with open(CLASSIFIER_PATH, 'rb') as file:
    model, class_names = pickle.load(file)
print("Custom Classifier successfully loaded")

tf.compat.v1.disable_eager_execution()
gpu_options = tf.compat.v1.GPUOptions(per_process_gpu_memory_fraction=0.6)
sess = tf.compat.v1.Session(config=tf.compat.v1.ConfigProto(gpu_options=gpu_options, log_device_placement=False))

import facenet

with sess.as_default():
    print('Loading feature extraction model...')
    facenet.load_model(FACENET_MODEL_PATH)

    images_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("input:0")
    embeddings = tf.compat.v1.get_default_graph().get_tensor_by_name("embeddings:0")
    phase_train_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("phase_train:0")

    pnet, rnet, onet = align.detect_face.create_mtcnn(sess, "align")

detection_info = []
previous_faces = {}
lock = threading.Lock()

@app.route('/')
def index():
    return send_file('face.html')

@app.route('/detection_info')
def show_detection_info():
    detection_info_base64 = []
    
    try:
        with open('detection_info.csv', mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                image_path = f"static/images/{row['image_name']}"
                try:
                    image = cv2.imread(image_path)
                    _, buffer = cv2.imencode('.jpg', image)
                    image_base64 = base64.b64encode(buffer).decode('utf-8')
                    detection_info_base64.append({
                        "image": image_base64,
                        "name": row['name'],
                        "timestamp": row['timestamp']
                    })
                except Exception as e:
                    print(f"Error loading image {image_path}: {e}")
    except Exception as e:
        print(f"Error reading CSV file: {e}")

    return jsonify({'detection_info': detection_info_base64})


def save_detection_info(image, name, timestamp, full_frame=None):
    image_name = f"{name}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
    
    image_dir = os.path.join("static", "images")
    os.makedirs(image_dir, exist_ok=True)
    image_path = os.path.join(image_dir, image_name)

    cv2.imwrite(image_path, image)

    full_frame_name = None

    if full_frame is not None:
        full_frame_name = f"full_{name}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
        full_frame_path = os.path.join(image_dir, full_frame_name)
        cv2.imwrite(full_frame_path, full_frame)

    try:
        file_exists = False
        try:
            with open('detection_info.csv', mode='r') as f:
                file_exists = True
        except FileNotFoundError:
            file_exists = False

        with open('detection_info.csv', mode='a', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=["image_name", "name", "timestamp", "full_image_name"])
            if not file_exists:
                writer.writeheader()
            writer.writerow({
                "image_name": image_name,
                "name": name,
                "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "full_image_name": full_frame_name if full_frame_name is not None else ""
            })
    except Exception as e:
        print(f"Error saving detection info to CSV: {e}")


zone_x1, zone_y1, zone_x2, zone_y2 = 100, 100, 500, 500

def detect_and_save_faces(frame, bounding_boxes):
    faces_found = bounding_boxes.shape[0]
    global previous_faces
    global zone_x1, zone_y1, zone_x2, zone_y2

    det = bounding_boxes[:, 0:4]
    timestamp = datetime.now()

    for i in range(faces_found):
        bb = det[i].astype(np.int32)

        cropped = frame[bb[1]:bb[3], bb[0]:bb[2], :]
        if isinstance(cropped, np.ndarray) and cropped.size > 0:
            scaled = cv2.resize(cropped, (INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE),
                                interpolation=cv2.INTER_CUBIC)
            scaled = facenet.prewhiten(scaled)
            scaled_reshape = scaled.reshape(-1, INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3)
            feed_dict = {images_placeholder: scaled_reshape, phase_train_placeholder: False}
            emb_array = sess.run(embeddings, feed_dict=feed_dict)

            predictions = model.predict_proba(emb_array)
            best_class_indices = np.argmax(predictions, axis=1)
            best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
            best_name = class_names[best_class_indices[0]]

            with lock:
                if best_class_probabilities > 0.55:
                    if best_class_probabilities > 0.85 and (best_name not in previous_faces or
                                                              timestamp - previous_faces[best_name] > timedelta(minutes=2)):
                        save_detection_info(cropped, best_name, timestamp, frame)
                        previous_faces[best_name] = timestamp
                    elif best_class_probabilities < 0.65:
                        save_detection_info(cropped, "Unknown", timestamp, frame)
                        previous_faces["Unknown"] = timestamp


def generate_frames():
    global previous_faces
    cap = VideoStream(src=0, backend=cv2.CAP_DSHOW).start()
   
    global zone_x1, zone_y1, zone_x2, zone_y2
    zone_x1, zone_y1, zone_x2, zone_y2 = 100, 100, 500, 500

    while True:
        frame = cap.read()
        if frame is None:
            break

        cv2.rectangle(frame, (zone_x1, zone_y1), (zone_x2, zone_y2), (255, 0, 0), 2)

        frame = imutils.resize(frame, width=600)

        bounding_boxes, _ = align.detect_face.detect_face(frame, MINSIZE, pnet, rnet, onet, THRESHOLD, FACTOR)
        faces_found = bounding_boxes.shape[0]

        try:
            if faces_found > 0:
                detect_and_save_faces(frame, bounding_boxes)
                
            else:
                print("No faces found.")
        except Exception as e:
            print(f"Error during face detection or recognition: {e}")

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')



@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
