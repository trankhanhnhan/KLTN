// URL của video stream từ camera ESP32
const streamURL = 'http://<ESP32_IP>:<PORT>/stream';

// Gán URL video stream cho phần tử <img>
document.getElementById('stream').src = streamURL;
