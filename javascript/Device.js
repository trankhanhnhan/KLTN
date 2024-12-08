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

// Tạo một biến để lưu trữ trạng thái báo động
let fireAlarmStatus = "OFF"; 
let fireStatus = "OFF";
let smokeStatus = "OFF";
let temperatureStatus = "OFF";
let temperatureTimer = null;

// Lắng nghe thay đổi nhiệt độ trong phòng từ Firebase
firebase.database().ref("/LivingRoom1/nhietdo").on("value", function(snapshot) {
    const temperature = snapshot.val();
    document.getElementById("nhietdo").innerHTML = temperature;
    console.log("Nhiệt độ: " + temperature);

    // Kiểm tra xem nhiệt độ có lớn hơn 60°C không
    if (temperature > 60 && fireAlarmStatus !== "ON") {
        console.log("Cảnh báo: Nhiệt độ quá cao!");
        temperatureStatus = "ON";
        triggerFireAlarm();  // Gọi hàm kích hoạt báo động
    } else if (temperature <= 60 && temperatureStatus === "ON") {
        console.log("Nhiệt độ xuống dưới 60°C, tắt báo động!");
        temperatureStatus = "OFF";
        // Dừng báo động sau 5 giây nếu nhiệt độ đã xuống dưới 60°C
        clearTimeout(temperatureTimer);
        temperatureTimer = setTimeout(() => {
            checkAndStopFireAlarm();
        }, 5000);  // 5 giây
    }
});

// Lắng nghe trạng thái báo động từ Firebase
firebase.database().ref("/LivingRoom1/fireAlarm").on("value", function(snapshot) {
    if (snapshot.exists()) {
        fireAlarmStatus = snapshot.val();
        const fireAlarmInput = document.getElementById("fireAlarm");
        const textfireAlarm = document.getElementById("textfireAlarm");
        const fireAlarm = document.getElementById("firealarm");

        // Cập nhật trạng thái báo động trên giao diện người dùng
        if (fireAlarmInput && textfireAlarm) {
            fireAlarmInput.checked = (fireAlarmStatus === "ON");
            textfireAlarm.textContent = fireAlarmStatus;
            textfireAlarm.style.color = (fireAlarmStatus === "ON") ? "red" : "black";
            fireAlarm.style.color = (fireAlarmStatus === "ON") ? "red" : "#6a7076";
        }
    } else {
        console.log("Không có dữ liệu về fireAlarm!");
    }
});

// Hàm kích hoạt báo động cháy
function triggerFireAlarm() {
    if (fireAlarmStatus !== "ON") {
        fireAlarmStatus = "ON";  // Đánh dấu báo động đã bật
        console.log("Kích hoạt báo động cháy!");

        // Cập nhật trạng thái báo động trong Firebase
        firebase.database().ref("/LivingRoom1/fireAlarm").set("ON");

        // Phát âm thanh báo động nếu nó không đang phát
        const alarmSound = document.getElementById('alarmSound');
        if (alarmSound && alarmSound.paused) {
            alarmSound.play().catch(error => console.error('Lỗi khi phát âm thanh:', error));
        }
    }
}

// Hàm tắt báo động cháy khi cần thiết
function stopFireAlarm() {
    if (fireAlarmStatus === "ON") {
        fireAlarmStatus = "OFF";
        console.log("Tắt báo động cháy!");
        firebase.database().ref("/LivingRoom1/fireAlarm").set("OFF");

        // Dừng âm thanh báo động
        const alarmSound = document.getElementById('alarmSound');
        if (alarmSound && !alarmSound.paused) {
            alarmSound.pause();
            alarmSound.currentTime = 0;  // Reset lại âm thanh
        }
    }
}

// Lắng nghe trạng thái của cảm biến lửa từ Firebase
firebase.database().ref("/LivingRoom1/fire").on("value", function(snapshot) {
    fireStatus = snapshot.val();
    const fireStatusElem = document.getElementById("fire_node1");
    const fireNode1 = document.getElementById("firesensor_node1_id");

    if (fireStatus === "ON") {
        fireStatusElem.innerHTML = "DETECTED";
        fireStatusElem.style.color = "red";
        fireNode1.classList.add("zooming1");
        if (fireAlarmStatus !== "ON") {
            triggerFireAlarm();  // Kích hoạt báo động nếu phát hiện lửa
        }
    } else {
        fireStatusElem.innerHTML = "NOT DETECTED";
        fireStatusElem.style.color = "black";
        fireNode1.classList.remove("zooming1");
    }

    console.log("Lửa: " + fireStatus);
    checkAndStopFireAlarm();
});

// Lắng nghe trạng thái của cảm biến khói từ Firebase
firebase.database().ref("/LivingRoom1/smoke").on("value", function(snapshot) {
    smokeStatus = snapshot.val();
    const smokeStatusElem = document.getElementById("smoke_node1");
    const smokeNode1 = document.getElementById("smoke_node1_id");

    if (smokeStatus === "ON") {
        smokeStatusElem.innerHTML = "DETECTED";
        smokeStatusElem.style.color = "red";
        smokeNode1.classList.add("zooming2");
        if (fireAlarmStatus !== "ON") {
            triggerFireAlarm();  // Kích hoạt báo động nếu phát hiện khói
        }
    } else {
        smokeStatusElem.innerHTML = "NOT DETECTED";
        smokeStatusElem.style.color = "black";
        smokeNode1.classList.remove("zooming2");
    }

    console.log("Khói: " + smokeStatus);
    checkAndStopFireAlarm();
});

// Hàm kiểm tra và tắt báo động khi không còn tác nhân gây cháy
function checkAndStopFireAlarm() {
    const alarmSound = document.getElementById('alarmSound');

    // Kiểm tra xem báo động có bật khi có lửa hoặc khói không
    if (fireAlarmStatus === "ON" || fireStatus === "ON" || smokeStatus === "ON" || temperatureStatus === "ON") {
        if (alarmSound.paused) {
            alarmSound.play().catch(error => console.error('Lỗi khi phát âm thanh:', error));
        }
    } else {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        stopFireAlarm();  // Tắt báo động khi không còn tác nhân gây cháy
    }
}
