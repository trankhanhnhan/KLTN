import cv2
import threading
import imutils
import numpy as np
from datetime import datetime
import os
import pickle
import base64
import csv
import time
import tensorflow as tf
import align.detect_face
from flask import Flask, Response
from flask_socketio import SocketIO
from flask_cors import CORS

# Các giá trị cấu hình
MINSIZE = 20
THRESHOLD = [0.4, 0.5, 0.5]
FACTOR = 0.709
INPUT_IMAGE_SIZE = 160
CLASSIFIER_PATH = 'Models/face38class.pkl'
FACENET_MODEL_PATH = 'Models/20180402-114759.pb'

app = Flask(__name__, static_folder='static')
socketio = SocketIO(app)
CORS(app)

# Tải mô hình phân loại
with open(CLASSIFIER_PATH, 'rb') as file:
    model, class_names = pickle.load(file)
print("Custom Classifier successfully loaded")

# Khởi tạo TensorFlow session và MTCNN
tf.compat.v1.disable_eager_execution()
gpu_options = tf.compat.v1.GPUOptions(per_process_gpu_memory_fraction=1.0)
sess = tf.compat.v1.Session(config=tf.compat.v1.ConfigProto(gpu_options=gpu_options, log_device_placement=False))

import facenet
with sess.as_default():
    print('Loading feature extraction model...')
    facenet.load_model(FACENET_MODEL_PATH)

    images_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("input:0")
    embeddings = tf.compat.v1.get_default_graph().get_tensor_by_name("embeddings:0")
    phase_train_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("phase_train:0")
    pnet, rnet, onet = align.detect_face.create_mtcnn(sess, "align")


# Khóa để đảm bảo tính thread-safe khi lưu ảnh
lock = threading.Lock()

def save_detection_info(image, name, timestamp, full_frame=None):
    image_name = f"{name}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
    image_dir = os.path.join("static", "images")
    os.makedirs(image_dir, exist_ok=True)
    image_path = os.path.join(image_dir, image_name)
    print(f"Saving image to: {image_path}")  # Debugging line
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

# Hàm gọi lưu ảnh async
def save_detection_info_async(image, name, timestamp, full_frame=None):
    def save_image():
        save_detection_info(image, name, timestamp, full_frame)

    thread = threading.Thread(target=save_image)
    thread.start()

# Biến lưu trạng thái khuôn mặt đã nhận diện
face_positions = {}

def detect_and_save_faces(frame, bounding_boxes):
    global face_positions
    faces_found = bounding_boxes.shape[0]
    det = bounding_boxes[:, 0:4]
    timestamp = datetime.now()
    current_faces = set()
    current_time = time.time()

    for i in range(faces_found):
        bb = det[i].astype(np.int32)
        cropped = frame[bb[1]:bb[3], bb[0]:bb[2], :]

        if cropped.shape[0] > 10 and cropped.shape[1] > 10:  # Check cropped image dimensions
            scaled = cv2.resize(cropped, (INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE), interpolation=cv2.INTER_CUBIC)
            scaled = facenet.prewhiten(scaled)
            scaled_reshape = scaled.reshape(-1, INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3)
            feed_dict = {images_placeholder: scaled_reshape, phase_train_placeholder: False}
            emb_array = sess.run(embeddings, feed_dict=feed_dict)

            predictions = model.predict_proba(emb_array)
            best_class_indices = np.argmax(predictions, axis=1)
            confidence = predictions[0, best_class_indices[0]]

            best_name = "Unknown"
            color = (0, 0, 255)  # Red for unknown
            label = f"Unknown: {confidence:.2f}"

            if confidence > 0.7:  # Recognized face
                best_name = class_names[best_class_indices[0]]
                color = (0, 255, 0)  # Green for known faces
                label = f"{best_name}: {confidence:.2f}"

            # Update or initialize face_positions
            with lock:
                if best_name not in face_positions:
                    face_positions[best_name] = {
                        "captured": False,
                        "position": bb,
                        "last_capture_time": current_time,
                        "first_seen_time": current_time
                    }
                else:
                    face_positions[best_name]["position"] = bb
                    face_positions[best_name]["last_capture_time"] = current_time

            # Add the detected face to the current_faces set
            current_faces.add(best_name)

            # Calculate elapsed_time
            first_seen_time = face_positions[best_name].get("first_seen_time", current_time)
            elapsed_time = current_time - first_seen_time
            print(f"Elapsed time for {best_name}: {elapsed_time:.2f} seconds")

            # Capture the image and reset the timer
            if elapsed_time >= 5:
                with lock:
                    save_detection_info_async(cropped, best_name, timestamp, frame)
                    # Reset first_seen_time after capturing
                    face_positions[best_name]["first_seen_time"] = current_time

            # Draw bounding box and label
            corner_size = 10  # Size of corner lines
            cv2.line(frame, (bb[0], bb[1]), (bb[0] + corner_size, bb[1]), color, 2)
            cv2.line(frame, (bb[0], bb[1]), (bb[0], bb[1] + corner_size), color, 2)
            cv2.line(frame, (bb[2], bb[1]), (bb[2] - corner_size, bb[1]), color, 2)
            cv2.line(frame, (bb[2], bb[1]), (bb[2], bb[1] + corner_size), color, 2)
            cv2.line(frame, (bb[0], bb[3]), (bb[0] + corner_size, bb[3]), color, 2)
            cv2.line(frame, (bb[0], bb[3]), (bb[0], bb[3] - corner_size), color, 2)
            cv2.line(frame, (bb[2], bb[3]), (bb[2] - corner_size, bb[3]), color, 2)
            cv2.line(frame, (bb[2], bb[3]), (bb[2], bb[3] - corner_size), color, 2)

            # Add label
            cv2.putText(frame, label, (bb[0], bb[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # Reset elapsed_time for faces not detected in current frame
    with lock:
        for name in face_positions.keys():
            if name not in current_faces:
                face_positions[name]["first_seen_time"] = current_time



# Hàm sinh các khung hình video
def generate_frames():
    phone_camera_url = "http://172.20.10.7:81/stream"
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Failed to connect to the camera.")
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame from phone camera.")
                break

            frame = imutils.resize(frame, width=640, height=480)
            bounding_boxes, _ = align.detect_face.detect_face(frame, MINSIZE, pnet, rnet, onet, THRESHOLD, FACTOR)
            faces_found = bounding_boxes.shape[0]

            if faces_found > 0:
                detect_and_save_faces(frame, bounding_boxes)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    finally:
        cap.release()

# Route Flask để phát video
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == "__main__":
    socketio.start_background_task(generate_frames)
    socketio.run(app, host='0.0.0.0', port=5400)