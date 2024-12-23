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

# Các giá trị cấu hình
MINSIZE = 20
THRESHOLD = [0.6, 0.7, 0.7]
FACTOR = 0.709
INPUT_IMAGE_SIZE = 160
CLASSIFIER_PATH = 'Models/facemodel.pkl'
FACENET_MODEL_PATH = 'Models/20180402-114759.pb'

# Khởi tạo Flask app
from flask import Flask, Response, send_file, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

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

# Dữ liệu theo dõi mặt và thời gian lưu ảnh
face_positions = {}
capture_interval = 5  # Chỉ chụp ảnh người lạ mỗi 5 giây


# Khóa để đảm bảo tính thread-safe khi lưu ảnh
lock = threading.Lock()

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

# Hàm gọi lưu ảnh async
def save_detection_info_async(image, name, timestamp, full_frame=None):
    def save_image():
        save_detection_info(image, name, timestamp, full_frame)

    thread = threading.Thread(target=save_image)
    thread.start()

def detect_and_save_faces(frame, bounding_boxes):
    faces_found = bounding_boxes.shape[0]
    global face_positions

    det = bounding_boxes[:, 0:4]
    timestamp = datetime.now()

    current_faces = set()
    current_time = time.time()

    for i in range(faces_found):
        bb = det[i].astype(np.int32)
        cropped = frame[bb[1]:bb[3], bb[0]:bb[2], :]

        if isinstance(cropped, np.ndarray) and cropped.size > 0:
            scaled = cv2.resize(cropped, (INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE), interpolation=cv2.INTER_CUBIC)
            scaled = facenet.prewhiten(scaled)
            scaled_reshape = scaled.reshape(-1, INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3)
            feed_dict = {images_placeholder: scaled_reshape, phase_train_placeholder: False}
            emb_array = sess.run(embeddings, feed_dict=feed_dict)

            predictions = model.predict_proba(emb_array)
            best_class_indices = np.argmax(predictions, axis=1)
            best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
            confidence = best_class_probabilities[0]

            best_name = ""
            color = (0, 0, 255)  # Màu đỏ mặc định cho "Unknown"
            label = f"Unknown: {confidence:.2f}"

            # Điều kiện cho người nhận diện với độ tin cậy cao (> 0.82) - Người quen
            if confidence > 0.82:
                best_name = class_names[best_class_indices[0]]
                color = (0, 255, 255)  # Màu vàng cho người quen
                label = f"{best_name}: {confidence:.2f}"

                # Chỉ lưu người quen vào face_positions
                if best_name not in face_positions:
                    face_positions[best_name] = {"captured": False, "position": bb, "last_capture_time": 0}

            # Điều kiện cho người nhận diện với độ tin cậy thấp (Unknown) - Người lạ
            elif 0.5 <= confidence <= 0.6:
                best_name = "Unknown"
                color = (0, 0, 255)  # Màu đỏ cho "Unknown"
                label = f"Unknown: {confidence:.2f}"

                # Đánh dấu thời gian để chụp ảnh người lạ mỗi 5 giây
                if best_name not in face_positions:
                    face_positions[best_name] = {"captured": False, "position": bb, "last_capture_time": 0}
                
                # Kiểm tra nếu người lạ chưa được chụp ảnh và đủ thời gian chờ (5 giây)
                if current_time - face_positions[best_name]["last_capture_time"] >= 10:
                    with lock:
                        save_detection_info_async(cropped, best_name, timestamp, frame)
                        face_positions[best_name]["captured"] = True  # Đánh dấu là đã chụp
                        face_positions[best_name]["last_capture_time"] = current_time  # Cập nhật thời gian chụp

            # Kiểm tra nếu best_name không phải là chuỗi rỗng và nếu chưa chụp ảnh
            if best_name and not face_positions.get(best_name, {}).get("captured", False):
                # Kiểm tra thời gian chụp trước đó
                if current_time - face_positions[best_name]["last_capture_time"] >= capture_interval:
                    # Chỉ chụp ảnh nếu người đó chưa được chụp và đủ thời gian chờ
                    with lock:
                        save_detection_info_async(cropped, best_name, timestamp, frame)
                        face_positions[best_name]["captured"] = True  # Đánh dấu là đã chụp
                        face_positions[best_name]["last_capture_time"] = current_time  # Cập nhật thời gian chụp

            # Vẽ hộp bao quanh và nhãn lên khung hình
            if best_name:
                cv2.rectangle(frame, (bb[0], bb[1]), (bb[2], bb[3]), color, 2)
                cv2.putText(frame, label, (bb[0], bb[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # Thêm người vào danh sách các khuôn mặt hiện tại
            current_faces.add(best_name)

    # Xóa các người không còn trong khung hình (nếu không còn nhận diện được nữa)
    for name in list(face_positions.keys()):
        if name not in current_faces:
            # Nếu người đó không còn trong khung hình, đánh dấu họ là chưa được chụp và loại bỏ khỏi danh sách
            face_positions[name]["captured"] = False
            del face_positions[name]



# Hàm sinh các khung hình video
def generate_frames():
    phone_camera_url = "http://172.20.10.7:81/stream"
    cap = cv2.VideoCapture(phone_camera_url)

    if not cap.isOpened():
        print("Failed to connect to the camera.")
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame from phone camera.")
                break

            frame = imutils.resize(frame, width=600)
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
