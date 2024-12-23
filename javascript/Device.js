const firebaseConfig = {
    apiKey: "AIzaSyD-33ZdWNZC2mYqLkbYnWvd7pEhM_JXd7M",
    authDomain: "dht11-517c9.firebaseapp.com",
    databaseURL: "https://dht11-517c9-default-rtdb.firebaseio.com",
    projectId: "dht11-517c9",
    storageBucket: "dht11-517c9.firebasestorage.app",
    messagingSenderId: "1015008081044",
    appId: "1:1015008081044:web:634a039c72961e8f6b7081"
  };
firebase.initializeApp(firebaseConfig);

//------------------------CHECK LOGIN STAGESTAGE--------------------------------------------
firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        window.location.href = './index.html';
    }
});

//-----------------------GO TO LOGOUT STAGE--------------------------------------
const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', () => {
    firebase.auth().signOut()
        .then(() => {
            console.log('User signed out successfully.');
            window.location.href = './index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});

//--------------------------CHANGE CONTENT-------------------------------------
function toggleContent() {
    var content1 = document.getElementById('content1');
    var content2 = document.getElementById('content2');
    if (content1.style.display === 'none') {
        content1.style.display = 'block';
        content2.style.display = 'none';
    } else {
        content1.style.display = 'none';
        content2.style.display = 'block';
    }
}

//--------------------------MENU TOOGLE------------------------------------------
		let toggle = document.querySelector('.toggle');
		let navigation = document.querySelector('.navigation');
		let main = document.querySelector('.main');

		toggle.onclick = function(){
			navigation.classList.toggle('active');
			main.classList.toggle('active');
			toggle.classList.toggle('active');
		}

		// add hovered class in selected list item
		let list = document.querySelectorAll('.navigation li');
		function activeLink(){
			list.forEach((item) =>
			item.classList.remove('hovered'));
			this.classList.add('hovered');
		}
		list.forEach((item) => 
		item.addEventListener('mouseover',activeLink));

//------------------Create a variable to store the alarm status---------------------
let fireAlarmStatus = "OFF"; 
let fireStatus1 = "OFF";
let smokeStatus1 = "OFF";
let temperatureStatus = "OFF";
let temperatureTimer = null;

let fireAlarmStatus2 = "OFF"; 
let fireStatus2 = "OFF";
let smokeStatus2 = "OFF";
let temperatureStatus2 = "OFF";
let temperatureTimer2 = null;

let alarmDelayTimeout = null;

function checkAndStopFireAlarm() {
    const alarmSound = document.getElementById('alarmSound');
    if (fireStatus === "ON" || fireStatus1 === "ON" || smokeStatus1 === "ON" || temperatureStatus === "ON") {
        if (alarmDelayTimeout) {
            clearTimeout(alarmDelayTimeout);
            alarmDelayTimeout = null;
        }
        if (alarmSound.paused) {
            alarmSound.play().catch(error => console.error('Error playing sound:', error));
        }
    } else {
        if (!alarmDelayTimeout) {
            alarmDelayTimeout = setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
                alarmDelayTimeout = null;
            }, 5000);
        }
    }
}

let alarmTimeout = null;
firebase.database().ref("/SensorData/Warehouse1/flame").on("value", function (snapshot) {
    const flameValue1 = snapshot.val();
    const fireStatusElem = document.getElementById("fire_node1");
    const fireNode1 = document.getElementById("firesensor_node1_id");

    if (flameValue1 !== null) {
        console.log("Giá trị flame: " + flameValue1);

        if (parseInt(flameValue1) === 1) {
            fireStatusElem.innerHTML = "DETECTED";
            fireStatusElem.style.color = "red";
            fireNode1.classList.add("zooming1");
            fireStatus1 = "ON"; 
        } else {
            if (!alarmTimeout) {
                alarmTimeout = setTimeout(() => {
                    fireStatusElem.innerHTML = "NOT DETECTED";
                    fireStatusElem.style.color = "black";
                    fireNode1.classList.remove("zooming1");
                    alarmTimeout = null;
                }, 5000);
            }
            fireStatus1 = "OFF";
        }
    } else {
        console.log("No data available for flame sensor!");
    }
    checkAndStopFireAlarm();
});

let smokeAlarmTimeout = null;
firebase.database().ref("/SensorData/Warehouse1/smoke").on("value", function (snapshot) {
    const smokeValue1 = snapshot.val();
    const smokeStatusElem = document.getElementById("smoke_node1");
    const smokeNode1 = document.getElementById("smoke_node1_id");

    if (smokeValue1 !== null) {
        console.log("Giá trị smoke: " + smokeValue1);

        if (parseInt(smokeValue1) === 1) {
            smokeStatusElem.innerHTML = "DETECTED";
            smokeStatusElem.style.color = "red";
            smokeNode1.classList.add("zooming2");
            smokeStatus1 = "ON";
        } else {
            if (!smokeAlarmTimeout) {
                smokeAlarmTimeout = setTimeout(() => {
                    smokeStatusElem.innerHTML = "NOT DETECTED";
                    smokeStatusElem.style.color = "black";
                    smokeNode1.classList.remove("zooming2");
                    smokeAlarmTimeout = null;
                }, 5000);
            }
            smokeStatus1 = "OFF";
        }
    } else {
        console.log("No data available for smoke sensor!");
    }

    checkAndStopFireAlarm();
});

firebase.database().ref("/SensorData/Warehouse1/temperature").on("value", function (snapshot) {
    const temperature = snapshot.val();
    const temperatureElem = document.getElementById("nhietdo");
    temperatureElem.innerHTML = temperature;
    console.log("Nhiệt độ: " + temperature);

    if (temperature > 50) {
        console.log("Cảnh báo: Nhiệt độ quá cao!");
        temperatureStatus = "ON";
    }  else if (temperature <= 50 && temperatureStatus === "ON") {
        console.log("Nhiệt độ xuống dưới 60°C, tắt báo động!");
        temperatureStatus = "OFF";
        clearTimeout(temperatureTimer);
        temperatureTimer = setTimeout(() => {
        }, 5000);
    }
    checkAndStopFireAlarm();
});

firebase.database().ref("/SensorData/Warehouse1/humidity").on("value", function(snapshot) {
    const humidity = snapshot.val();
    document.getElementById("doam").innerHTML = humidity;
    console.log("Độ ẩm: " + humidity);
});

//----------------CONNECT LIGHT TO FIREBASE-----------------
firebase.database().ref("/Control/Warehouse1/light").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var lightStatus = snapshot.val();
        var lightInput = document.getElementById("light");
        var textLight = document.getElementById("textlight");
        var theLight = document.getElementById("thelight");

        if (lightInput && textLight && theLight) {
            var isLightOn = (lightStatus === 1); // Trạng thái ON nếu lightStatus là "1"
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
        var lightState = this.checked ? 1 : 0; // Lưu trạng thái dưới dạng 1 hoặc 0
        firebase.database().ref("/Control/Warehouse1/").update({
            "light": lightState,
            "WEBcontrol": 1
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
firebase.database().ref("/Control/Warehouse1/fan").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var fanStatus = snapshot.val();
        var fanInput = document.getElementById("fan");
        var textfan = document.getElementById("textfan");
        var thefan = document.getElementById("thefan");

        if (fanInput && textfan && thefan) {
            var isFanOn = (fanStatus === 1);
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
        var fanState = this.checked ? 1 : 0;
        firebase.database().ref("/Control/Warehouse1/").update({
            "fan": fanState,
            "WEBcontrol": 1
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
let alarmDelayTimeout2 = null;

function checkAndStopFireAlarm2() {
    const alarmSound = document.getElementById('alarmSound');

    if (fireStatus2 === "ON" || smokeStatus2 === "ON" || temperatureStatus2 === "ON") {
        if (alarmDelayTimeout2) {
            clearTimeout(alarmDelayTimeout2);
            alarmDelayTimeout2 = null;
        }
        if (alarmSound.paused) {
            alarmSound.play().catch(error => console.error('Error playing sound:', error));
        }
    } else {
        if (!alarmDelayTimeout2) {
            alarmDelayTimeout2 = setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
                alarmDelayTimeout2 = null;
            }, 5000);
        }
    }
}

// Lắng nghe giá trị cảm biến lửa từ Firebase (WareHouse2)
firebase.database().ref("/SensorData/Warehouse2/flame").on("value", function(snapshot) {
    const flameValue2 = snapshot.val();
    const fireStatusElem2 = document.getElementById("fire_node2");
    const fireNode2 = document.getElementById("firesensor_node2_id");

    if (flameValue2 !== null) {
        console.log("Giá trị lửa (WareHouse2): " + flameValue2);

        if (parseInt(flameValue2) == 1) {
            if (fireAlarmTimeout2) {
                clearTimeout(fireAlarmTimeout2); // Hủy bỏ timeout nếu đang chạy
                fireAlarmTimeout2 = null;
            }
            fireStatusElem2.innerHTML = "DETECTED";
            fireStatusElem2.style.color = "red";
            fireNode2.classList.add("zooming1");
            fireStatus2 = "ON";
        } else {
            if (!fireAlarmTimeout2) {
                fireAlarmTimeout2 = setTimeout(() => {
                    fireStatusElem2.innerHTML = "NOT DETECTED";
                    fireStatusElem2.style.color = "black";
                    fireNode2.classList.remove("zooming1");
                    fireAlarmTimeout2 = null;
                }, 5000);
            }
            fireStatus2 = "OFF";
        }
    } else {
        console.log("No data available for fire sensor (WareHouse2)!");
    }
    checkAndStopFireAlarm2();
});

// Lắng nghe giá trị cảm biến khói từ Firebase (WareHouse2)
firebase.database().ref("/SensorData/Warehouse2/smoke").on("value", function(snapshot) {
    const smokeValue2 = snapshot.val();
    const smokeStatusElem2 = document.getElementById("smoke_node2");
    const smokeNode2 = document.getElementById("smoke_node2_id");

    if (smokeValue2 !== null) {
        console.log("Giá trị khói (WareHouse2): " + smokeValue2);

        if (parseInt(smokeValue2) == 1) {
            if (smokeAlarmTimeout2) {
                clearTimeout(smokeAlarmTimeout2);
                smokeAlarmTimeout2 = null;
            }
            smokeStatusElem2.innerHTML = "DETECTED";
            smokeStatusElem2.style.color = "red";
            smokeNode2.classList.add("zooming2");
            smokeStatus2 = "ON";
        } else {
            if (!smokeAlarmTimeout2) {
                smokeAlarmTimeout2 = setTimeout(() => {
                    smokeStatusElem2.innerHTML = "NOT DETECTED";
                    smokeStatusElem2.style.color = "black";
                    smokeNode2.classList.remove("zooming2");
                    smokeAlarmTimeout2 = null;
                }, 5000);
            }
            smokeStatus2 = "OFF";
        }
    } else {
        console.log("No data available for smoke sensor (WareHouse2)!");
    }
    checkAndStopFireAlarm2();
});

  // Lắng nghe thay đổi nhiệt độ trong phòng từ Firebase
firebase.database().ref("/SensorData/Warehouse2/temperature").on("value", function(snapshot) {
    const temperature = snapshot.val();
    document.getElementById("nhietdo2").innerHTML = temperature;
    console.log("Nhiệt độ: " + temperature);

    if (temperature > 50 && fireAlarmStatus2 !== "ON") {
        console.log("Cảnh báo: Nhiệt độ quá cao!");
        temperatureStatus2 = "ON";
    } else if (temperature <= 50 && temperatureStatus2 === "ON") {
        console.log("Nhiệt độ xuống dưới 60°C, tắt báo động!");
        temperatureStatus2 = "OFF";
        clearTimeout(temperatureTimer2);
        temperatureTimer2 = setTimeout(() => {
        }, 5000);
    }
    checkAndStopFireAlarm2();
});

firebase.database().ref("/SensorData/Warehouse2/humidity").on("value", function(snapshot) {
    const humidity = snapshot.val();
    document.getElementById("doam2").innerHTML = humidity;
    console.log("Độ ẩm: " + humidity);
});

// Kết nối và lắng nghe trạng thái đèn từ Firebase (WareHouse2)
firebase.database().ref("/Control/Warehouse2/light").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var lightStatus2 = snapshot.val();
        var lightInput2 = document.getElementById("light2");
        var textLight2 = document.getElementById("textlight2");
        var theLight2 = document.getElementById("thelight2");

        if (lightInput2 && textLight2 && theLight2) {
            var isLightOn2 = (lightStatus2 === 1);
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
        var lightState2 = this.checked ? 1 : 0;
        firebase.database().ref("/Control/Warehouse2/").update({
            "light": lightState2,
            "WEBcontrol": 1
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
firebase.database().ref("/Control/Warehouse2/fan").on("value", function(snapshot) {
    if (snapshot.exists()) {
        console.log(snapshot.val());
        var fanStatus2 = snapshot.val();
        var fanInput2 = document.getElementById("fan2");
        var textfan2 = document.getElementById("textfan2");
        var thefan2 = document.getElementById("thefan2");

        if (fanInput2 && textfan2 && thefan2) {
            var isFanOn2 = (fanStatus2 === 1);
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
        var fanState2 = this.checked ? 1 : 0;
        firebase.database().ref("/Control/Warehouse2/").update({
            "fan": fanState2,
            "WEBcontrol": 1
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


let lastUpdateWarehouse1 = 0;
let lastUpdateWarehouse2 = 0;

function updateWarehouseStatus() {
    const now = Date.now() / 1000; // Chuyển đổi timestamp hiện tại sang giây

    // Kiểm tra trạng thái của Warehouse 1
    if (now - lastUpdateWarehouse1 > 300) { // 120 giây = 2 phút
        document.getElementById("warehouse-status").innerHTML = "(INACTIVE)";
        document.getElementById("warehouse-status").style.color = "red";
    } else {
        document.getElementById("warehouse-status").innerHTML = "(ACTIVE)";
        document.getElementById("warehouse-status").style.color = "green";
    }

    // Kiểm tra trạng thái của Warehouse 2
    if (now - lastUpdateWarehouse2 > 300) {
        document.getElementById("warehouse2-status").innerHTML = "(INACTIVE)";
        document.getElementById("warehouse2-status").style.color = "red";
    } else {
        document.getElementById("warehouse2-status").innerHTML = "(ACTIVE)";
        document.getElementById("warehouse2-status").style.color = "green";
    }
}

// Lắng nghe dữ liệu từ Firebase cho Warehouse 1
firebase.database().ref("/SensorData/Warehouse1/timestamp").on("value", function(snapshot) {
    if (snapshot.exists()) {
        lastUpdateWarehouse1 = snapshot.val(); 
        updateWarehouseStatus(); 
    }
});

// Lắng nghe dữ liệu từ Firebase cho Warehouse 2
firebase.database().ref("/SensorData/Warehouse2/timestamp").on("value", function(snapshot) {
    if (snapshot.exists()) {
        lastUpdateWarehouse2 = snapshot.val(); 
        updateWarehouseStatus(); 
    }
});

setInterval(updateWarehouseStatus, 5000);

let fireDetectedTimer = null; // Bộ đếm thời gian để kiểm tra trạng thái lửa
let fireWarningSent = false; // Biến kiểm tra đã gửi cảnh báo hay chưa
let fireStatus = "OFF";

firebase.database().ref("/Warning/camdetect").on("value", function(snapshot) {
    fireStatus = snapshot.val();
    const fireStatusElem = document.getElementById("fire_node1");
    const fireNode1 = document.getElementById("firesensor_node1_id");

    if (fireStatus === "ON") {
        fireStatusElem.innerHTML = "DETECTED";
        fireStatusElem.style.color = "red";
        fireNode1.classList.add("zooming1");

        if (!fireDetectedTimer) {
            fireDetectedTimer = setTimeout(() => {
                if (fireStatus === "ON" && !fireWarningSent) {
                    firebase.database().ref("/Camera/Alerts").set({
                        status: "Fire Detected",
                        timestamp: new Date().toISOString()
                    });
                    fireWarningSent = true;
                    console.log("Cảnh báo cháy đã được gửi!");
                }
            }, 5000);
        }
    } else {
        fireStatusElem.innerHTML = "NOT DETECTED";
        fireStatusElem.style.color = "black";
        fireNode1.classList.remove("zooming1");

        if (fireDetectedTimer) {
            clearTimeout(fireDetectedTimer);
            fireDetectedTimer = null;
        }
        fireWarningSent = false;
    }

    console.log("Lửa: " + fireStatus);
    checkAndStopFireAlarm();
});