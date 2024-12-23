from flask import Flask, send_file, Response
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import torch
from ultralytics import YOLO
import time
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
socketio = SocketIO(app)

# Load mô hình YOLO
model = YOLO('best.pt')
model.to('cuda') # Sử dụng GPU


fire_detected = False
fire_start_time = None
fire_end_time = None 
FIRE_THRESHOLD = 5 
FIRE_OFF_DELAY = 5 

cred = credentials.Certificate("/Github/KLTN/dht11-517c9-firebase-adminsdk-p4tuk-7bdd749ef2.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://dht11-517c9-default-rtdb.firebaseio.com/'
})
fire_ref = db.reference('/Warning/camdetect')
def generate_frames():
    global fire_detected, fire_start_time, fire_end_time
    phone_camera_url = "http://172.20.10.5:81/stream"
    cap = cv2.VideoCapture(phone_camera_url)

    if not cap.isOpened():
        print("Không thể kết nối với camera điện thoại.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Không thể lấy được khung hình từ camera.")
            break

        width = 640
        height = int((frame.shape[0] / frame.shape[1]) * width)
        resized_frame = cv2.resize(frame, (width, height))

        results = model(resized_frame)

        if results:
            fire_detected = False

            for result in results:
                if hasattr(result, 'boxes') and result.boxes is not None:
                    boxes = result.boxes.xyxy.cpu().numpy()
                    confidences = result.boxes.conf.cpu().numpy()
                    class_ids = result.boxes.cls.cpu().numpy()

                    for box, conf, cls in zip(boxes, confidences, class_ids):
                        x1, y1, x2, y2 = box.astype(int)

                        if cls == 0:
                            label = f"Fire: {conf:.2f}"
                            color = (0, 255, 0)
                            fire_detected = True
                        elif cls == 1:
                            label = f"Smoke: {conf:.2f}"
                            color = (0, 0, 255)
                        else:
                            continue

                        cv2.rectangle(resized_frame, (x1, y1), (x2, y2), color, 2)
                        cv2.putText(resized_frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            if fire_detected:
                if fire_start_time is None:
                    fire_start_time = time.time() 
                    fire_end_time = None
                else:
                    elapsed_time = time.time() - fire_start_time
                    if elapsed_time >= FIRE_THRESHOLD:
                        print("Lửa đã được phát hiện! Kích hoạt cảnh báo!")
                        fire_ref.set("ON")
            else:
                if fire_end_time is None:
                    fire_end_time = time.time()
                else:
                    elapsed_time = time.time() - fire_end_time
                    if elapsed_time >= FIRE_OFF_DELAY:
                        print("Lửa đã tắt. Tắt cảnh báo.")
                        fire_ref.set("OFF")

        _, buffer = cv2.imencode('.jpg', resized_frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

    cap.release()

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return send_file('cam.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == "__main__":
    socketio.start_background_task(generate_frames)
    socketio.run(app, host='0.0.0.0', port=5000)