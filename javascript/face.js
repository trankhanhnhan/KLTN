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
            window.location.href = './index.html'; // Chuyển về trang login
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});

function checkAndStopFireAlarm() {
    const alarmSound = document.getElementById('alarmSound');
    const isAlarmOn =
        fireStatus3 === "ON" ||
        fireStatusCam === "ON" ||
        smokeStatus1 === "ON" ||
        temperatureStatus === "ON" ||
        fireStatus2 === "ON" ||
        smokeStatus2 === "ON" ||
        temperatureStatus2 === "ON";

    if (isAlarmOn) {
        // Bật chuông nếu bất kỳ cảm biến nào đang ở trạng thái "ON"
        if (alarmSound.paused) {
            alarmSound.play().catch(error => console.error('Error playing sound:', error));
        }
        if (alarmDelayTimeout) {
            clearTimeout(alarmDelayTimeout);
            alarmDelayTimeout = null;
        }
    } else {
        // Tắt chuông sau 5 giây nếu không còn cảm biến nào ở trạng thái "ON"
        if (!alarmDelayTimeout) {
            alarmDelayTimeout = setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
                alarmDelayTimeout = null;
            }, 1000);
        }
    }
}

let fireDetectedTimer = null; // Bộ đếm thời gian để kiểm tra trạng thái lửa
let fireWarningSent = false; // Biến kiểm tra đã gửi cảnh báo hay chưa
let fireCamera = "OFF";
let fireAlarmTimeout3 = null;
let fireStatus3 = "OFF";

firebase.database().ref("/Warning/camdetect").on("value", function(snapshot) {
    fireCamera = snapshot.val();
    const fireStatusElem3 = document.getElementById("fire_node3");
    const fireNode3 = document.getElementById("firesensor_node3_id");

    if (fireCamera === "ON") {
        if (fireAlarmTimeout3) {
            clearTimeout(fireAlarmTimeout3); 
            fireAlarmTimeout3 = null;
        }
        fireStatusElem3.innerHTML = "DETECTED";
        fireStatusElem3.style.color = "red";
        fireNode3.classList.add("zooming1");
        fireStatus3 = "ON";

        if (!fireDetectedTimer) {
            fireDetectedTimer = setTimeout(() => {
                if (fireCamera === "ON" && !fireWarningSent) {
                    firebase.database().ref("/Camera/Alerts").set({
                        status: "Fire Detected",
                        timestamp: new Date().toISOString()
                    });
                    fireWarningSent = true;
                    console.log("Cảnh báo cháy đã được gửi!");
                }
            }, 4000);
        }
    } else {
        fireStatusElem3.innerHTML = "NOT DETECTED";
        fireStatusElem3.style.color = "black";
        fireNode3.classList.remove("zooming1");
        fireStatus3 = "OFF";

        if (fireDetectedTimer) {
            clearTimeout(fireDetectedTimer);
            fireDetectedTimer = null;
        }
        fireWarningSent = false;
    }

    console.log("Lửa: " + fireCamera);
    checkAndStopFireAlarm();
});