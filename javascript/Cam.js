const firebaseConfig = {
    apiKey: "AIzaSyD5pqDw2o4AyjiARrFEP8nBwG4g2kmRStQ",
    authDomain: "nhan-3660d.firebaseapp.com",
    databaseURL: "https://nhan-3660d-default-rtdb.firebaseio.com",
    projectId: "nhan-3660d",
    storageBucket: "nhan-3660d.firebasestorage.app",
    messagingSenderId: "1054276103106",
    appId: "1:1054276103106:web:428ec651a347fa0b39045b",
    measurementId: "G-27TGW7MZDB"
  };
firebase.initializeApp(firebaseConfig);

// Tạo một biến để lưu trữ trạng thái phát hiện lửa
let fireDetectedTimer = null; // Bộ đếm thời gian để kiểm tra trạng thái lửa
let fireWarningSent = false; // Biến kiểm tra đã gửi cảnh báo hay chưa

// Lắng nghe trạng thái của cảm biến lửa từ Firebase
firebase.database().ref("/KLTN/Device/WareHouse1/fire").on("value", function(snapshot) {
    fireStatus = snapshot.val();
    const fireStatusElem = document.getElementById("fire_node1");
    const fireNode1 = document.getElementById("firesensor_node1_id");

    if (fireStatus === "ON") {
        fireStatusElem.innerHTML = "DETECTED";
        fireStatusElem.style.color = "red";
        fireNode1.classList.add("zooming1");

        // Nếu lửa được phát hiện và chưa có bộ đếm, khởi động bộ đếm
        if (!fireDetectedTimer) {
            fireDetectedTimer = setTimeout(() => {
                if (fireStatus === "ON" && !fireWarningSent) {
                    // Gửi cảnh báo cháy lên Firebase sau 5 giây phát hiện lửa
                    firebase.database().ref("/KLTN/Alerts").set({
                        status: "Fire Detected",
                        timestamp: new Date().toISOString()
                    });
                    fireWarningSent = true; // Đánh dấu đã gửi cảnh báo
                    console.log("Cảnh báo cháy đã được gửi!");
                }
            }, 5000); // 5 giây
        }
    } else {
        fireStatusElem.innerHTML = "NOT DETECTED";
        fireStatusElem.style.color = "black";
        fireNode1.classList.remove("zooming1");

        // Nếu lửa không còn, xóa bộ đếm và đặt lại trạng thái cảnh báo
        if (fireDetectedTimer) {
            clearTimeout(fireDetectedTimer);
            fireDetectedTimer = null;
        }
        fireWarningSent = false; // Đặt lại trạng thái để có thể gửi cảnh báo mới
    }

    console.log("Lửa: " + fireStatus);
    checkAndStopFireAlarm();
});
