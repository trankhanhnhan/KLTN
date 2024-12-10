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

// Tạo một biến để lưu trữ trạng thái báo động
let fireAlarmStatus = "OFF"; 
let fireStatus = "OFF";
let smokeStatus = "OFF";
let temperatureStatus = "OFF";
let temperatureTimer = null;

let fireAlarmStatus2 = "OFF"; 
let fireStatus2 = "OFF";
let smokeStatus2 = "OFF";
let temperatureStatus2 = "OFF";
let temperatureTimer2 = null;

let shouldToggleFireAlarm = false;

let alarmTimeout = null; // Biến để quản lý timeout

// Lắng nghe giá trị cảm biến flame từ Firebase
firebase.database().ref("/SensorData/WareHouse1/flame").on("value", function(snapshot) {
    const flameValue = snapshot.val(); // Lấy giá trị flame từ Firebase
    const fireStatusElem = document.getElementById("fire_node1");
    const fireNode1 = document.getElementById("firesensor_node1_id");

    if (flameValue !== null) {
        console.log("Giá trị flame: " + flameValue);

        // Kiểm tra nếu flame > 500, cập nhật trạng thái fire thành DETECTED
        if (parseInt(flameValue) > 500) {
            // Xóa timeout nếu có (không tắt báo động khi flame lại vượt 500)
            if (alarmTimeout) {
                clearTimeout(alarmTimeout);
                alarmTimeout = null;
            }

            // Cập nhật trạng thái fire trên Firebase
            firebase.database().ref("/SensorData/WareHouse1/").update({
                "fire": "DETECTED"
            });

            // Cập nhật giao diện
            fireStatusElem.innerHTML = "DETECTED";
            fireStatusElem.style.color = "red";
            fireNode1.classList.add("zooming1");

            // Kích hoạt báo động nếu cần
            if (typeof triggerFireAlarm === "function") {
                triggerFireAlarm();
            }
        } else {
            // Cập nhật trạng thái fire thành NOT DETECTED nếu flame <= 500
            firebase.database().ref("/SensorData/WareHouse1/").update({
                "fire": "NOT DETECTED"
            });

            // Trì hoãn việc tắt báo động thêm 5 giây
            if (!alarmTimeout) {
                alarmTimeout = setTimeout(() => {
                    // Cập nhật giao diện
                    fireStatusElem.innerHTML = "NOT DETECTED";
                    fireStatusElem.style.color = "black";
                    fireNode1.classList.remove("zooming1");

                    // Dừng báo động nếu không còn cháy
                    if (typeof checkAndStopFireAlarm === "function") {
                        checkAndStopFireAlarm();
                    }

                    alarmTimeout = null; // Đặt lại biến timeout
                }, 5000); // Trì hoãn 5 giây
            }
        }
    } else {
        console.log("No data available for flame sensor!");
    }
});


let smokeAlarmTimeout = null; // Biến để quản lý timeout

// Lắng nghe giá trị cảm biến smoke từ Firebase
firebase.database().ref("/SensorData/WareHouse1/smoke").on("value", function(snapshot) {
    const smokeValue = snapshot.val(); // Lấy giá trị smoke từ Firebase
    const smokeStatusElem = document.getElementById("smoke_node1");
    const smokeNode1 = document.getElementById("smoke_node1_id");

    if (smokeValue !== null) {
        console.log("Giá trị smoke: " + smokeValue);

        // Kiểm tra nếu smoke > 500, cập nhật trạng thái Smoke thành DETECTED
        if (parseInt(smokeValue) > 500) {
            // Xóa timeout nếu có (không tắt báo động khi smoke lại vượt 500)
            if (smokeAlarmTimeout) {
                clearTimeout(smokeAlarmTimeout);
                smokeAlarmTimeout = null;
            }

            // Cập nhật trạng thái Smoke trên Firebase
            firebase.database().ref("/SensorData/WareHouse1/").update({
                "Smoke": "DETECTED"
            });

            // Cập nhật giao diện
            smokeStatusElem.innerHTML = "DETECTED";
            smokeStatusElem.style.color = "red";
            smokeNode1.classList.add("zooming2");

            // Kích hoạt báo động nếu cần
            if (typeof triggerFireAlarm === "function") {
                triggerFireAlarm();
            }
        } else {
            // Cập nhật trạng thái Smoke thành NOT DETECTED nếu smoke <= 500
            firebase.database().ref("/SensorData/WareHouse1/").update({
                "Smoke": "NOT DETECTED"
            });

            // Trì hoãn việc tắt báo động thêm 5 giây
            if (!smokeAlarmTimeout) {
                smokeAlarmTimeout = setTimeout(() => {
                    // Cập nhật giao diện
                    smokeStatusElem.innerHTML = "NOT DETECTED";
                    smokeStatusElem.style.color = "black";
                    smokeNode1.classList.remove("zooming2");

                    // Dừng báo động nếu không còn khói
                    if (typeof checkAndStopFireAlarm === "function") {
                        checkAndStopFireAlarm();
                    }

                    smokeAlarmTimeout = null; // Đặt lại biến timeout
                }, 5000); // Trì hoãn 5 giây
            }
        }
    } else {
        console.log("No data available for smoke sensor!");
    }
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


// Lắng nghe thay đổi nhiệt độ trong phòng từ Firebase
firebase.database().ref("/SensorData/WareHouse1/nhietdo").on("value", function(snapshot) {
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

firebase.database().ref("/SensorData/WareHouse1/doam").on("value", function(snapshot) {
    const humidity = snapshot.val();
    document.getElementById("doam").innerHTML = humidity;
    console.log("Độ ẩm: " + humidity);
});

//----------------CONNECT LIGHT TO FIREBASE-----------------
// Lắng nghe trạng thái đèn từ Firebase
firebase.database().ref("/Control/WareHouse1/light").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var lightStatus = snapshot.val();
        var lightInput = document.getElementById("light");
        var textLight = document.getElementById("textlight");
        var theLight = document.getElementById("thelight");

        if (lightInput && textLight && theLight) {
            var isLightOn = (lightStatus === "1"); // Trạng thái ON nếu lightStatus là "1"
            lightInput.checked = isLightOn;
            textLight.textContent = isLightOn ? "ON" : "OFF"; // Hiển thị ON/OFF
            textLight.style.color = isLightOn ? "red" : "black";
            theLight.style.color = isLightOn ? "#dbdb0bed" : "#6a7076";
        }
    } else {
        console.log("No data available for light!");
    }
});

// Điều khiển đèn từ giao diện web
var lightInput = document.getElementById('light');
if (lightInput) {
    lightInput.addEventListener('change', function() {
        var lightState = this.checked ? "1" : "0"; // Lưu trạng thái dưới dạng 1 hoặc 0
        firebase.database().ref("/Control/WareHouse1/").update({
            "light": lightState,
            "WEBcontrol": "1"
        }).then(function() {
            console.log("Light state updated and WEBcontrol set to 1");
        }).catch(function(error) {
            console.error("Error updating light state: ", error);
        });

        var textLight = document.getElementById("textlight");
        if (textLight) {
            textLight.textContent = this.checked ? "ON" : "OFF"; // Hiển thị ON/OFF
            textLight.style.color = this.checked ? "red" : "black";
        }
    });
}

// Lắng nghe trạng thái quạt từ Firebase
firebase.database().ref("/Control/WareHouse1/fan").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var fanStatus = snapshot.val();
        var fanInput = document.getElementById("fan");
        var textfan = document.getElementById("textfan");
        var thefan = document.getElementById("thefan");

        if (fanInput && textfan && thefan) {
            var isFanOn = (fanStatus === "1");
            fanInput.checked = isFanOn;
            textfan.textContent = isFanOn ? "ON" : "OFF";
            textfan.style.color = isFanOn ? "red" : "black";
            thefan.style.color = isFanOn ? "#000000" : "#6a7076";
        }
    } else {
        console.log("No data available for fan!");
    }
});

// Điều khiển quạt từ giao diện web
var fanInput = document.getElementById('fan');
if (fanInput) {
    fanInput.addEventListener('change', function() {
        var fanState = this.checked ? "1" : "0";
        firebase.database().ref("/Control/WareHouse1/").update({
            "fan": fanState,
            "WEBcontrol": "1"
        }).then(function() {
            console.log("Fan state updated and WEBcontrol set to 1");
        }).catch(function(error) {
            console.error("Error updating fan state: ", error);
        });

        var textfan = document.getElementById("textfan");
        if (textfan) {
            textfan.textContent = this.checked ? "ON" : "OFF";
            textfan.style.color = this.checked ? "red" : "black";
        }
    });
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
let fireAlarmTimeout2 = null;
let smokeAlarmTimeout2 = null;

// Lắng nghe giá trị cảm biến lửa từ Firebase (WareHouse2)
firebase.database().ref("/SensorData/WareHouse2/flame").on("value", function(snapshot) {
    const fireValue2 = snapshot.val();
    const fireStatusElem2 = document.getElementById("fire_node2");
    const fireNode2 = document.getElementById("firesensor_node2_id");

    if (fireValue2 !== null) {
        console.log("Giá trị lửa (WareHouse2): " + fireValue2);

        // Nếu giá trị lửa vượt ngưỡng 500
        if (parseInt(fireValue2) > 500) {
            if (fireAlarmTimeout2) {
                clearTimeout(fireAlarmTimeout2); // Hủy bỏ timeout nếu đang chạy
                fireAlarmTimeout2 = null;
            }

            firebase.database().ref("/SensorData/WareHouse2/").update({
                "Fire": "DETECTED"
            });

            fireStatusElem2.innerHTML = "DETECTED";
            fireStatusElem2.style.color = "red";
            fireNode2.classList.add("zooming1");

            if (typeof triggerFireAlarm === "function") {
                triggerFireAlarm();
            }
        } else {
            firebase.database().ref("/SensorData/WareHouse2/").update({
                "Fire": "NOT DETECTED"
            });

            if (!fireAlarmTimeout2) {
                fireAlarmTimeout2 = setTimeout(() => {
                    fireStatusElem2.innerHTML = "NOT DETECTED";
                    fireStatusElem2.style.color = "black";
                    fireNode2.classList.remove("zooming1");

                    if (typeof checkAndStopFireAlarm === "function") {
                        checkAndStopFireAlarm();
                    }

                    fireAlarmTimeout2 = null; // Reset timeout
                }, 5000); // Duy trì báo động thêm 5 giây
            }
        }
    } else {
        console.log("No data available for fire sensor (WareHouse2)!");
    }
});

// Lắng nghe giá trị cảm biến khói từ Firebase (WareHouse2)
firebase.database().ref("/SensorData/WareHouse2/smoke").on("value", function(snapshot) {
    const smokeValue2 = snapshot.val();
    const smokeStatusElem2 = document.getElementById("smoke_node2");
    const smokeNode2 = document.getElementById("smoke_node2_id");

    if (smokeValue2 !== null) {
        console.log("Giá trị khói (WareHouse2): " + smokeValue2);

        if (parseInt(smokeValue2) > 500) {
            if (smokeAlarmTimeout2) {
                clearTimeout(smokeAlarmTimeout2);
                smokeAlarmTimeout2 = null;
            }

            firebase.database().ref("/SensorData/WareHouse2/").update({
                "Smoke": "DETECTED"
            });

            smokeStatusElem2.innerHTML = "DETECTED";
            smokeStatusElem2.style.color = "red";
            smokeNode2.classList.add("zooming2");

            if (typeof triggerFireAlarm === "function") {
                triggerFireAlarm();
            }
        } else {
            firebase.database().ref("/SensorData/WareHouse2/").update({
                "Smoke": "NOT DETECTED"
            });

            if (!smokeAlarmTimeout2) {
                smokeAlarmTimeout2 = setTimeout(() => {
                    smokeStatusElem2.innerHTML = "NOT DETECTED";
                    smokeStatusElem2.style.color = "black";
                    smokeNode2.classList.remove("zooming2");

                    if (typeof checkAndStopFireAlarm === "function") {
                        checkAndStopFireAlarm();
                    }

                    smokeAlarmTimeout2 = null;
                }, 5000);
            }
        }
    } else {
        console.log("No data available for smoke sensor (WareHouse2)!");
    }
});


// Hàm kiểm tra và tắt báo động khi không còn tác nhân gây cháy
function checkAndStopFireAlarm() {
    const alarmSound = document.getElementById('alarmSound');

    if (fireAlarmStatus2 === "ON" || fireStatus2 === "ON" || smokeStatus2 === "ON" || temperatureStatus2 === "ON") {
        if (alarmSound.paused) {
            alarmSound.play().catch(error => console.error('Lỗi khi phát âm thanh:', error));
        }
    } else {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        stopFireAlarm();
    }
}

  // Lắng nghe thay đổi nhiệt độ trong phòng từ Firebase
firebase.database().ref("/SensorData/WareHouse2/nhietdo").on("value", function(snapshot) {
    const temperature = snapshot.val();
    document.getElementById("nhietdo2").innerHTML = temperature;
    console.log("Nhiệt độ: " + temperature);

    if (temperature > 60 && fireAlarmStatus2 !== "ON") {
        console.log("Cảnh báo: Nhiệt độ quá cao!");
        temperatureStatus2 = "ON";
        triggerFireAlarm();
    } else if (temperature <= 60 && temperatureStatus2 === "ON") {
        console.log("Nhiệt độ xuống dưới 60°C, tắt báo động!");
        temperatureStatus2 = "OFF";
        clearTimeout(temperatureTimer2);
        temperatureTimer2 = setTimeout(() => {
            checkAndStopFireAlarm();
        }, 5000);  // 5 giây
    }
});

firebase.database().ref("/SensorData/WareHouse2/doam").on("value", function(snapshot) {
    const humidity = snapshot.val();
    document.getElementById("doam2").innerHTML = humidity;
    console.log("Độ ẩm: " + humidity);
});

// Kết nối và lắng nghe trạng thái đèn từ Firebase (WareHouse2)
firebase.database().ref("/Control/WareHouse2/light").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var lightStatus2 = snapshot.val();
        var lightInput2 = document.getElementById("light2");
        var textLight2 = document.getElementById("textlight2");
        var theLight2 = document.getElementById("thelight2");

        if (lightInput2 && textLight2 && theLight2) {
            var isLightOn2 = (lightStatus2 === "1");
            lightInput2.checked = isLightOn2;
            textLight2.textContent = isLightOn2 ? "ON" : "OFF";
            textLight2.style.color = isLightOn2 ? "red" : "black";
            theLight2.style.color = isLightOn2 ? "#dbdb0bed" : "#6a7076";
        }
    } else {
        console.log("No data available for light!");
    }
});

// Điều khiển đèn từ giao diện web (WareHouse2)
var lightInput2 = document.getElementById('light2');
if (lightInput2) {
    lightInput2.addEventListener('change', function() {
        var lightState2 = this.checked ? "1" : "0";
        firebase.database().ref("/Control/WareHouse2/").update({
            "light": lightState2,
            "WEBcontrol": "1"
        }).then(function() {
            console.log("Light state updated and WEBcontrol set to 1");
        }).catch(function(error) {
            console.error("Error updating light state: ", error);
        });

        var textLight2 = document.getElementById("textlight2");
        if (textLight2) {
            textLight2.textContent = this.checked ? "ON" : "OFF";
            textLight2.style.color = this.checked ? "red" : "black";
        }
    });
}

// Kết nối và lắng nghe trạng thái quạt từ Firebase (WareHouse2)
firebase.database().ref("/Control/WareHouse2/fan").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var fanStatus2 = snapshot.val();
        var fanInput2 = document.getElementById("fan2");
        var textfan2 = document.getElementById("textfan2");
        var thefan2 = document.getElementById("thefan2");

        if (fanInput2 && textfan2 && thefan2) {
            var isFanOn2 = (fanStatus2 === "1");
            fanInput2.checked = isFanOn2;
            textfan2.textContent = isFanOn2 ? "ON" : "OFF";
            textfan2.style.color = isFanOn2 ? "red" : "black";
            thefan2.style.color = isFanOn2 ? "#000000" : "#6a7076";
        }
    } else {
        console.log("No data available for fan!");
    }
});

// Điều khiển quạt từ giao diện web (WareHouse2)
var fanInput2 = document.getElementById('fan2');
if (fanInput2) {
    fanInput2.addEventListener('change', function() {
        var fanState2 = this.checked ? "1" : "0";
        firebase.database().ref("/Control/WareHouse2/").update({
            "fan": fanState2,
            "WEBcontrol": "1"
        }).then(function() {
            console.log("Fan state updated and WEBcontrol set to 1");
        }).catch(function(error) {
            console.error("Error updating fan state: ", error);
        });

        var textfan2 = document.getElementById("textfan2");
        if (textfan2) {
            textfan2.textContent = this.checked ? "ON" : "OFF";
            textfan2.style.color = this.checked ? "red" : "black";
        }
    });
}
