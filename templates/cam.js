// URL của video stream từ camera ESP32
const streamURL = 'http://192.168.1.29:5000';

// Gán URL video stream cho phần tử <img>
document.getElementById('stream').src = streamURL;
