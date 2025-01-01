from flask import Flask, send_file, Response
from flask_socketio import SocketIO, emit
import cv2
import torch
from ultralytics import YOLO
import threading
from queue import Queue
import time
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
socketio = SocketIO(app)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = YOLO('best.pt').to(device)


fire_detected = False
fire_start_time = None
fire_end_time = None
FIRE_THRESHOLD = 5
FIRE_OFF_DELAY = 5

<<<<<<< Updated upstream
cred = credentials.Certificate("C:/KLTN-master/KLTN/dht11-517c9-firebase-adminsdk-p4tuk-6e6f8068f7.json")
=======
cred = credentials.Certificate("C:/KLTN-master/KLTN/nhan-3660d-firebase-adminsdk-n5jx7-62c7c4ee83.json")
>>>>>>> Stashed changes
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://nhan-3660d-default-rtdb.firebaseio.com/'
})
fire_ref = db.reference('/Warning/camdetect')

frame_queue = Queue(maxsize=10)
output_frame = None
lock = threading.Lock()


def detect_fire():
    global fire_detected, fire_start_time, fire_end_time, output_frame
<<<<<<< Updated upstream
    phone_camera_url = "http://172.20.10.5:81/stream"
=======
>>>>>>> Stashed changes
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Không thể kết nối với camera.")
        return

    frame_counter = 0
    prev_time = time.time()  # Thời gian trước đó để tính FPS

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Không thể lấy khung hình.")
            break

        width = 640
        height = 480
        resized_frame = cv2.resize(frame, (width, height))

        # Tính FPS
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time)
        prev_time = curr_time

        if frame_counter % 1 == 0:
            results = model(resized_frame, verbose=False)

            if results:
                fire_detected = False

                for result in results:
                    if hasattr(result, 'boxes') and result.boxes is not None:
                        boxes = result.boxes.xyxy.cpu().numpy()
                        confidences = result.boxes.conf.cpu().numpy()
                        class_ids = result.boxes.cls.cpu().numpy()

                        for box, conf, cls in zip(boxes, confidences, class_ids):
                            x1, y1, x2, y2 = box.astype(int)

                            if conf > 0.4:  # Kiểm tra ngưỡng tin cậy
                                if cls == 0:
                                    label = f"Fire: {conf:.2f}"
                                    color = (0, 255, 0)
                                    fire_detected = True
                                elif cls == 1:
                                    label = f"Smoke: {conf:.2f}"
                                    color = (0, 0, 255)
                                else:
                                    continue

                                # Vẽ hộp và nhãn lên ảnh
                                cv2.rectangle(resized_frame, (x1, y1), (x2, y2), color, 2)
                                cv2.putText(resized_frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                # Hiển thị FPS trên video
                cv2.putText(resized_frame, f"FPS: {fps:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

                # Cập nhật trạng thái cảnh báo Firebase
                if fire_detected:
                    if fire_start_time is None:
                        fire_start_time = time.time()
                        fire_end_time = None
                    else:
                        elapsed_time = time.time() - fire_start_time
                        if elapsed_time >= FIRE_THRESHOLD:
                            fire_ref.set("ON")
                else:
                    if fire_end_time is None:
                        fire_end_time = time.time()
                    else:
                        elapsed_time = time.time() - fire_end_time
                        if elapsed_time >= FIRE_OFF_DELAY:
                            fire_ref.set("OFF")

        with lock:
            output_frame = resized_frame.copy()

        frame_counter += 1

    cap.release()


def generate_frames():
    global output_frame
    while True:
        with lock:
            if output_frame is None:
                continue
            _, buffer = cv2.imencode('.jpg', output_frame)
            frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


if __name__ == "__main__":
    threading.Thread(target=detect_fire, daemon=True).start()
<<<<<<< Updated upstream
    socketio.run(app, host='0.0.0.0', port=5000)
=======
    socketio.run(app, host='0.0.0.0', port=5000)
>>>>>>> Stashed changes
