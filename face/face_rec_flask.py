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

# Các thông số và cấu hình của bạn
MINSIZE = 20
THRESHOLD = [0.6, 0.7, 0.7]
FACTOR = 0.709
INPUT_IMAGE_SIZE = 160
CLASSIFIER_PATH = 'Models/facemodel.pkl'
FACENET_MODEL_PATH = 'Models/20180402-114759.pb'

# Load the custom classifier
with open(CLASSIFIER_PATH, 'rb') as file:
    model, class_names = pickle.load(file)
print("Custom Classifier successfully loaded")

# Configure TensorFlow to use GPU if available
tf.compat.v1.disable_eager_execution()
gpu_options = tf.compat.v1.GPUOptions(per_process_gpu_memory_fraction=0.6)
sess = tf.compat.v1.Session(config=tf.compat.v1.ConfigProto(gpu_options=gpu_options, log_device_placement=False))

# Import facenet here
import facenet

with sess.as_default():
    # Load the FaceNet model
    print('Loading feature extraction model...')
    facenet.load_model(FACENET_MODEL_PATH)

    # Get input and output tensors from the model
    images_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("input:0")
    embeddings = tf.compat.v1.get_default_graph().get_tensor_by_name("embeddings:0")
    phase_train_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("phase_train:0")

    # Load MTCNN model for face detection
    pnet, rnet, onet = align.detect_face.create_mtcnn(sess, "align")

# Initialize the person detection counter and storage for detection info
detection_info = []
previous_faces = {}  # Thay đổi từ set sang dict để lưu thời gian
lock = threading.Lock()  # Thread lock to protect shared data

@app.route('/')
def index():
    return send_file('face.html')  # Đảm bảo face.html nằm trong cùng thư mục với file Python

@app.route('/detection_info')
def show_detection_info():
    detection_info_base64 = []
    
    # Đọc dữ liệu từ file CSV
    try:
        with open('detection_info.csv', mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Chuyển đổi hình ảnh thành Base64 cho hiển thị
                image_path = f"static/images/{row['image_name']}"  # Đảm bảo rằng hình ảnh được lưu vào thư mục này
                try:
                    image = cv2.imread(image_path)
                    _, buffer = cv2.imencode('.jpg', image)  # Chuyển đổi hình ảnh thành JPEG
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

    return jsonify({'detection_info': detection_info_base64})  # Trả về dữ liệu dưới dạng JSON


def save_detection_info(image, name, timestamp, full_frame=None):
    # Create filename for the detected face image
    image_name = f"{name}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
    
    # Absolute path to the image storage directory (static/images)
    image_dir = os.path.join("static", "images")
    os.makedirs(image_dir, exist_ok=True)  # Ensure the directory exists
    image_path = os.path.join(image_dir, image_name)

    # Save the detected face image
    cv2.imwrite(image_path, image)

    # Initialize full_frame_name with a default value
    full_frame_name = None  # Initialize as None or an empty string

    # Save the full frame image if provided
    if full_frame is not None:
        full_frame_name = f"full_{name}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
        full_frame_path = os.path.join(image_dir, full_frame_name)
        cv2.imwrite(full_frame_path, full_frame)

    # Check and write information to CSV
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
                "full_image_name": full_frame_name if full_frame_name is not None else ""  # Ensure it's safe to use
            })
    except Exception as e:
        print(f"Error saving detection info to CSV: {e}")


# Định nghĩa tọa độ cho vùng nhận diện
zone_x1, zone_y1, zone_x2, zone_y2 = 100, 100, 500, 500  # Thay đổi tọa độ này theo yêu cầu

def detect_and_save_faces(frame, bounding_boxes):
    faces_found = bounding_boxes.shape[0]
    global previous_faces  # Biến toàn cục để theo dõi trạng thái phát hiện
    global zone_x1, zone_y1, zone_x2, zone_y2  # Khai báo biến toàn cục cho vùng nhận diện

    det = bounding_boxes[:, 0:4]
    timestamp = datetime.now()  # Lấy thời gian hiện tại để kiểm tra

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
                # Chụp ảnh cho người đã biết (xác suất cao) và người lạ (xác suất thấp)
                if best_class_probabilities > 0.55:
                    # Kiểm tra thời gian đã trôi qua kể từ lần chụp cuối
                    if best_class_probabilities > 0.85 and (best_name not in previous_faces or
                                                              timestamp - previous_faces[best_name] > timedelta(minutes=2)):
                        save_detection_info(cropped, best_name, timestamp, frame)  # Truyền toàn cảnh
                        previous_faces[best_name] = timestamp  # Cập nhật thời gian chụp
                    elif best_class_probabilities < 0.65:
                        save_detection_info(cropped, "Unknown", timestamp, frame)  # Truyền toàn cảnh
                        previous_faces["Unknown"] = timestamp  # Cập nhật thời gian chụp


def generate_frames():
    global previous_faces  # Biến toàn cục để theo dõi trạng thái phát hiện
    cap = VideoStream(src=0, backend=cv2.CAP_DSHOW).start()

    # Định nghĩa tọa độ cho vùng nhận diện
    global zone_x1, zone_y1, zone_x2, zone_y2  # Đảm bảo rằng các biến này được định nghĩa ở đây
    zone_x1, zone_y1, zone_x2, zone_y2 = 100, 100, 500, 500  # Thay đổi tọa độ này theo yêu cầu

    while True:
        frame = cap.read()
        if frame is None:
            break

        # Vẽ vùng nhận diện lên khung hình
        cv2.rectangle(frame, (zone_x1, zone_y1), (zone_x2, zone_y2), (255, 0, 0), 2)  # Vùng nhận diện

        # Xử lý khung hình (nhận diện khuôn mặt, v.v.)
        frame = imutils.resize(frame, width=600)

        # Detect faces
        bounding_boxes, _ = align.detect_face.detect_face(frame, MINSIZE, pnet, rnet, onet, THRESHOLD, FACTOR)
        faces_found = bounding_boxes.shape[0]

        try:
            if faces_found > 0:  # Nếu có khuôn mặt được phát hiện
                detect_and_save_faces(frame, bounding_boxes)  # Gọi trực tiếp hàm để phát hiện và lưu khuôn mặt
                
            else:
                print("No faces found.")
        except Exception as e:
            print(f"Error during face detection or recognition: {e}")

        # Chuyển đổi khung hình sang JPEG
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
