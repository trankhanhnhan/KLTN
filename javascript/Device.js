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

// Lắng nghe trạng thái của cảm biến lửa từ Firebase
firebase.database().ref("/KLTN/Device/WareHouse1/fire").on("value", function(snapshot) {
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
firebase.database().ref("/KLTN/Device/WareHouse1/smoke").on("value", function(snapshot) {
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


// Lắng nghe thay đổi nhiệt độ trong phòng từ Firebase
firebase.database().ref("/KLTN/Device/WareHouse1/nhietdo").on("value", function(snapshot) {
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

firebase.database().ref("/KLTN/Device/WareHouse1/doam").on("value", function(snapshot) {
    const humidity = snapshot.val();
    document.getElementById("doam").innerHTML = humidity;
    console.log("Độ ẩm: " + humidity);
});

//----------------CONNECT LIGHT TO FIREBASE-----------------
firebase.database().ref("/KLTN/Device/WareHouse1/light").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var lightStatus = snapshot.val();
        var lightInput = document.getElementById("light");
        var textLight = document.getElementById("textlight");
        var theLight = document.getElementById("thelight");
  
        if (lightInput && textLight && theLight) {
            lightInput.checked = (lightStatus === "ON");
            textLight.textContent = lightStatus;
            textLight.style.color = (lightStatus === "ON") ? "red" : "black";
            theLight.style.color = (lightStatus === "ON") ? "#dbdb0bed" : "#6a7076";
        }
    } else {
        console.log("No data available for light!");
    }
  });
  
  
  //-----------------CONTROL LIGHT FROM THE WEB----------------------
  var lightInput = document.getElementById('light');
  if (lightInput) {
    lightInput.addEventListener('change', function() {
        var lightState = this.checked ? "ON" : "OFF";
        firebase.database().ref("/KLTN/Device/WareHouse1/").update({
            "light": lightState
        });
        var textLight = document.getElementById("textlight");
        if (textLight) {
            textLight.textContent = lightState;
            textLight.style.color = (lightState === "ON") ? "red" : "black";
        }
    });
  }

  //----------------CONNECT FAN TO FIREBASE-----------------
firebase.database().ref("/KLTN/Device/WareHouse1/fan").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var fanStatus = snapshot.val();
        var fanInput = document.getElementById("fan");
        var textfan = document.getElementById("textfan");
        var thefan = document.getElementById("thefan");
  
        if (fanInput && textfan && thefan) {
            fanInput.checked = (fanStatus === "ON");
            textfan.textContent = fanStatus;
            textfan.style.color = (fanStatus === "ON") ? "red" : "black";
            thefan.style.color = (fanStatus === "ON") ? "#000000" : "#6a7076";
        }
    } else {
        console.log("No data available for fan!");
    }
  });
  
  
  //-----------------CONTROL FAN FROM THE WEB----------------------
  var fanInput = document.getElementById('fan');
  if (fanInput) {
    fanInput.addEventListener('change', function() {
        var fanState = this.checked ? "ON" : "OFF";
        firebase.database().ref("/KLTN/Device/WareHouse1/").update({
            "fan": fanState
        });
        var textfan = document.getElementById("textfan");
        if (textfan) {
            textfan.textContent = fanState;
            textfan.style.color = (fanState === "ON") ? "red" : "black";
        }
    });
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
  // Lắng nghe trạng thái của cảm biến lửa từ Firebase
firebase.database().ref("/KLTN/Device/WareHouse2/fire").on("value", function(snapshot) {
    fireStatus2 = snapshot.val();
    const fireStatusElem2 = document.getElementById("fire_node2");
    const fireNode2 = document.getElementById("firesensor_node2_id");

    if (fireStatus2 === "ON") {
        fireStatusElem2.innerHTML = "DETECTED";
        fireStatusElem2.style.color = "red";
        fireNode2.classList.add("zooming1");
        if (fireAlarmStatus2 !== "ON") {
            triggerFireAlarm();  // Kích hoạt báo động nếu phát hiện lửa
        }
    } else {
        fireStatusElem2.innerHTML = "NOT DETECTED";
        fireStatusElem2.style.color = "black";
        fireNode2.classList.remove("zooming1");
    }

    console.log("Lửa: " + fireStatus2);
    checkAndStopFireAlarm();
});

// Lắng nghe trạng thái của cảm biến khói từ Firebase
firebase.database().ref("/KLTN/Device/WareHouse2/smoke").on("value", function(snapshot) {
    smokeStatus2 = snapshot.val();
    const smokeStatusElem2 = document.getElementById("smoke_node2");
    const smokeNode2 = document.getElementById("smoke_node2_id");

    if (smokeStatus2 === "ON") {
        smokeStatusElem2.innerHTML = "DETECTED";
        smokeStatusElem2.style.color = "red";
        smokeNode2.classList.add("zooming2");
        if (fireAlarmStatus2 !== "ON") {
            triggerFireAlarm();  // Kích hoạt báo động nếu phát hiện khói
        }
    } else {
        smokeStatusElem2.innerHTML = "NOT DETECTED";
        smokeStatusElem2.style.color = "black";
        smokeNode2.classList.remove("zooming2");
    }

    console.log("Khói: " + smokeStatus2);
    checkAndStopFireAlarm();
});

// Hàm kiểm tra và tắt báo động khi không còn tác nhân gây cháy
function checkAndStopFireAlarm() {
    const alarmSound = document.getElementById('alarmSound');

    // Kiểm tra xem báo động có bật khi có lửa hoặc khói không
    if (fireAlarmStatus2 === "ON" || fireStatus2 === "ON" || smokeStatus2 === "ON" || temperatureStatus2 === "ON") {
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
firebase.database().ref("/KLTN/Device/WareHouse2/nhietdo").on("value", function(snapshot) {
    const temperature = snapshot.val();
    document.getElementById("nhietdo2").innerHTML = temperature;
    console.log("Nhiệt độ: " + temperature);

    // Kiểm tra xem nhiệt độ có lớn hơn 60°C không
    if (temperature > 60 && fireAlarmStatus2 !== "ON") {
        console.log("Cảnh báo: Nhiệt độ quá cao!");
        temperatureStatus2 = "ON";
        triggerFireAlarm();  // Gọi hàm kích hoạt báo động
    } else if (temperature <= 60 && temperatureStatus2 === "ON") {
        console.log("Nhiệt độ xuống dưới 60°C, tắt báo động!");
        temperatureStatus2 = "OFF";
        // Dừng báo động sau 5 giây nếu nhiệt độ đã xuống dưới 60°C
        clearTimeout(temperatureTimer2);
        temperatureTimer2 = setTimeout(() => {
            checkAndStopFireAlarm();
        }, 5000);  // 5 giây
    }
});

firebase.database().ref("/KLTN/Device/WareHouse2/doam").on("value", function(snapshot) {
    const humidity = snapshot.val();
    document.getElementById("doam2").innerHTML = humidity;
    console.log("Độ ẩm: " + humidity);
});

//----------------CONNECT LIGHT TO FIREBASE-----------------
firebase.database().ref("/KLTN/Device/WareHouse2/light").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var lightStatus2 = snapshot.val();
        var lightInput2 = document.getElementById("light2");
        var textLight2 = document.getElementById("textlight2");
        var theLight2 = document.getElementById("thelight2");
  
        if (lightInput2 && textLight2 && theLight2) {
            lightInput2.checked = (lightStatus2 === "ON");
            textLight2.textContent = lightStatus2;
            textLight2.style.color = (lightStatus2 === "ON") ? "red" : "black";
            theLight2.style.color = (lightStatus2 === "ON") ? "#dbdb0bed" : "#6a7076";
        }
    } else {
        console.log("No data available for light!");
    }
  });
  
  
  //-----------------CONTROL LIGHT FROM THE WEB----------------------
  var lightInput2 = document.getElementById('light2');
  if (lightInput2) {
    lightInput2.addEventListener('change', function() {
        var lightState2 = this.checked ? "ON" : "OFF";
        firebase.database().ref("/KLTN/Device/WareHouse2/").update({
            "light": lightState2
        });
        var textLight2 = document.getElementById("textlight2");
        if (textLight2) {
            textLight2.textContent = lightState2;
            textLight2.style.color = (lightState2 === "ON") ? "red" : "black";
        }
    });
  }

  //----------------CONNECT FAN TO FIREBASE-----------------
firebase.database().ref("/KLTN/Device/WareHouse2/fan").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var fanStatus2 = snapshot.val();
        var fanInput2 = document.getElementById("fan2");
        var textfan2 = document.getElementById("textfan2");
        var thefan2 = document.getElementById("thefan2");
  
        if (fanInput2 && textfan2 && thefan2) {
            fanInput2.checked = (fanStatus2 === "ON");
            textfan2.textContent = fanStatus2;
            textfan2.style.color = (fanStatus2 === "ON") ? "red" : "black";
            thefan2.style.color = (fanStatus2 === "ON") ? "#000000" : "#6a7076";
        }
    } else {
        console.log("No data available for fan!");
    }
  });
  
  
  //-----------------CONTROL FAN FROM THE WEB----------------------
  var fanInput2 = document.getElementById('fan2');
  if (fanInput2) {
    fanInput2.addEventListener('change', function() {
        var fanState2 = this.checked ? "ON" : "OFF";
        firebase.database().ref("/KLTN/Device/WareHouse2/").update({
            "fan": fanState2
        });
        var textfan2 = document.getElementById("textfan2");
        if (textfan2) {
            textfan2.textContent = fanState2;
            textfan2.style.color = (fanState2 === "ON") ? "red" : "black";
        }
    });
  }