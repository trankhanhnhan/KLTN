const firebaseConfig = {
    apiKey: "AIzaSyD5pqDw2o4AyjiARrFEP8nBwG4g2kmRStQ",
    authDomain: "nhan-3660d.firebaseapp.com",
    databaseURL: "https://nhan-3660d-default-rtdb.firebaseio.com",
    projectId: "nhan-3660d",
    storageBucket: "nhan-3660d.appspot.com",
    messagingSenderId: "1054276103106",
    appId: "1:1054276103106:web:428ec651a347fa0b39045b",
    measurementId: "G-27TGW7MZDB"
};
firebase.initializeApp(firebaseConfig);

let fireStatus = false;  // Trạng thái của cảm biến lửa
let fireTimer = 0;  // Thời gian camera phát hiện lửa
let fireAlarmStatus = "OFF";  // Trạng thái báo động cháy

// Hàm kích hoạt báo động
function triggerFireAlarm() {
    if (fireAlarmStatus !== "ON") {
        fireAlarmStatus = "ON";  // Đánh dấu báo động đã được kích hoạt
        console.log("Kích hoạt báo động cháy!");
        // Kích hoạt báo động trên Firebase
        firebase.database().ref("/LivingRoom1/fireAlarm").set("ON");

        // Phát âm thanh báo động
        var alarmSound = document.getElementById('alarmSound');
        if (alarmSound && alarmSound.paused) {
            alarmSound.play().catch(error => console.log("Error playing alarm sound:", error));
        }
    }
}

// Firebase listener để theo dõi tất cả dữ liệu trong /LivingRoom1
firebase.database().ref("/LivingRoom1").on("value", function(snapshot) {
    const data = snapshot.val(); // Lấy toàn bộ dữ liệu từ Firebase một lần

    // Kiểm tra trạng thái của cảm biến lửa
    fireStatus = data.fire === "ON";
    console.log("Cảm biến lửa: " + fireStatus);

    // Nếu phát hiện lửa từ cảm biến
    if (fireStatus && fireAlarmStatus !== "ON") {
        console.log("Cảnh báo: Phát hiện lửa từ cảm biến!");
        triggerFireAlarm();
    }

    // Kiểm tra nếu camera phát hiện lửa (dựa trên fireTimer)
    if (fireStatus === false && fireTimer > 0 && fireTimer >= 5 && fireAlarmStatus !== "ON") {
        console.log("Cảnh báo: Phát hiện lửa từ camera!");
        triggerFireAlarm();
    }

    // Kiểm tra nhiệt độ
    const temperature = data.nhietdo;  // Lấy giá trị nhiệt độ từ Firebase
    console.log("Nhiệt độ: " + temperature);

    if (temperature > 60 && fireAlarmStatus !== "ON") {
        console.log("Cảnh báo: Nhiệt độ quá cao!");
        triggerFireAlarm();
    }

    // Kiểm tra khói
    const smokeStatus = data.smoke;
    console.log("Phát hiện khói: " + smokeStatus);

    if (smokeStatus === "ON" && fireAlarmStatus !== "ON") {
        console.log("Cảnh báo: Phát hiện khói!");
        triggerFireAlarm();
    }
});

// Firebase listener để theo dõi thời gian phát hiện lửa từ camera
firebase.database().ref("/LivingRoom1/fireCamera").on("value", function(snapshot) {
    if (snapshot.val() === "ON") {
        fireTimer++;  // Tăng thời gian phát hiện lửa từ camera
        console.log("Camera phát hiện lửa, thời gian: " + fireTimer);
    } else {
        fireTimer = 0;  // Reset lại timer khi không phát hiện lửa từ camera
    }
});
