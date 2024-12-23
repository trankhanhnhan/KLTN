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

var nhietdo = [];
var doam = [];
var khigas = [];
var nhietdo2 = [];
var doam2 = [];
var khigas2 = [];
var updateInterval = null;

const initialLabels = ['Initial'];
//-----------------CREATE CHARTS-----------------------------
const tempchart = new Chart(temperatureChartCanvas, {
  type: 'line',
  data: {
    labels: initialLabels,
    datasets: [{
      label: 'Temperature',
      data: nhietdo,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        ticks: {
          font: {
            size: 14
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 14
          },
          maxTicksLimit: 6,
          stepSize: 1
        }
      }
    }
  }
});

const humichart = new Chart(humidityChartCanvas, {
  type: 'line',
  data: {
    labels: initialLabels,
    datasets: [{
      label: 'Humidity',
      data: doam,
      borderColor: 'blue',
      backgroundColor: 'rgba(185, 249, 244, 0.8)',
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        ticks: {
          font: {
            size: 14
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 14
          },
          maxTicksLimit: 6,
          stepSize: 1
        }
      }
    }
  }
});

// const gaschart = new Chart(gasChartCanvas, {
//   type: 'line',
//   data: {
//     labels: initialLabels,
//     datasets: [{
//       label: 'CO2',
//       data: khigas,
//       borderColor: 'orange',
//       backgroundColor: 'rgba(250, 232, 198, 0.8)',
//       fill: true
//     }]
//   },
//   options: {
//     responsive: true,
//     scales: {
//       x: {
//         ticks: {
//           font: {
//             size: 14
//           }
//         }
//       },
//       y: {
//         ticks: {
//           font: {
//             size: 14
//           },
//           maxTicksLimit: 6,
//           stepSize: 1
//         }
//       }
//     }
//   }
// });

const tempchart2 = new Chart(temperatureChartCanvas2, {
  type: 'line',
  data: {
    labels: initialLabels,
    datasets: [{
      label: 'Temperature',
      data: nhietdo2,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        ticks: {
          font: {
            size: 14
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 14
          },
          maxTicksLimit: 6,
          stepSize: 1
        }
      }
    }
  }
});

const humichart2 = new Chart(humidityChartCanvas2, {
  type: 'line',
  data: {
    labels: initialLabels,
    datasets: [{
      label: 'Humidity',
      data: doam2,
      borderColor: 'blue',
      backgroundColor: 'rgba(185, 249, 244, 0.8)',
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        ticks: {
          font: {
            size: 14
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 14
          },
          maxTicksLimit: 6,
          stepSize: 1
        }
      }
    }
  }
});

// const gaschart2 = new Chart(gasChartCanvas2, {
//   type: 'line',
//   data: {
//     labels: initialLabels,
//     datasets: [{
//       label: 'CO2',
//       data: khigas2,
//       borderColor: 'orange',
//       backgroundColor: 'rgba(250, 232, 198, 0.8)',
//       fill: true
//     }]
//   },
//   options: {
//     responsive: true,
//     scales: {
//       x: {
//         ticks: {
//           font: {
//             size: 14
//           }
//         }
//       },
//       y: {
//         ticks: {
//           font: {
//             size: 14
//           },
//           maxTicksLimit: 6,
//           stepSize: 1
//         }
//       }
//     }
//   }
// });

function saveDataToLocalStorage() {
  localStorage.setItem('nhietdo_history', JSON.stringify(nhietdo));
  localStorage.setItem('doam_history', JSON.stringify(doam));
  localStorage.setItem('khigas_history', JSON.stringify(khigas));
  localStorage.setItem('nhietdo2_history', JSON.stringify(nhietdo2));
  localStorage.setItem('doam2_history', JSON.stringify(doam2));
  localStorage.setItem('khigas2_history', JSON.stringify(khigas2));
}

function getDataFromLocalStorage() {
  nhietdo = JSON.parse(localStorage.getItem('nhietdo_history')) || [];
  doam = JSON.parse(localStorage.getItem('doam_history')) || [];
  khigas = JSON.parse(localStorage.getItem('khigas_history')) || [];
  nhietdo2 = JSON.parse(localStorage.getItem('nhietdo2_history')) || [];
  doam2 = JSON.parse(localStorage.getItem('doam2_history')) || [];
  khigas2 = JSON.parse(localStorage.getItem('khigas2_history')) || [];
}

function updateDataAndSaveToLocalStorage() {
  saveDataToLocalStorage();
}

getDataFromLocalStorage();


function generateLabels(data) {
  return data.map(item => new Date(item.timestamp).toLocaleTimeString());
}

firebase.database().ref("/SensorData/Warehouse1/temperature").on("value", function(snapshot) {
  var nd = snapshot.val();
  nhietdo.push({ value: nd, timestamp: new Date().getTime() });
  document.getElementById("nhietdo").innerHTML = nd;
  console.log("Updated nhietdo: " + nd);
  tempchart.data.datasets[0].data = nhietdo.slice(-8).map(item => item.value);
  tempchart.data.labels = generateLabels(nhietdo.slice(-8));
  tempchart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/SensorData/Warehouse1/humidity").on("value", function(snapshot) {
  var damkk = snapshot.val();
  doam.push({ value: damkk, timestamp: new Date().getTime() });
  document.getElementById("doam").innerHTML = damkk;
  console.log("Updated doam: " + damkk);
  humichart.data.datasets[0].data = doam.slice(-8).map(item => item.value);
  humichart.data.labels = generateLabels(doam.slice(-8));
  humichart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/SensorData/Warehouse1/smoke").on("value", function(snapshot) {
  var kgas = snapshot.val();
  khigas.push({ value: kgas, timestamp: new Date().getTime() });
  document.getElementById("khigas").innerHTML = kgas;
  console.log("Updated khigas: " + kgas);
  gaschart.data.datasets[0].data = khigas.slice(-8).map(item => item.value);
  gaschart.data.labels = generateLabels(khigas.slice(-8));
  gaschart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/SensorData/Warehouse2/temperature").on("value", function(snapshot) {
  var ndkk = snapshot.val();
  nhietdo2.push({ value: ndkk, timestamp: new Date().getTime() });
  document.getElementById("nhietdo2").innerHTML = ndkk;
  console.log("Updated nhietdo2: " + ndkk);
  tempchart2.data.datasets[0].data = nhietdo2.slice(-8).map(item => item.value);
  tempchart2.data.labels = generateLabels(nhietdo2.slice(-8));
  tempchart2.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/SensorData/Warehouse2/humidity").on("value", function(snapshot) {
  var damdat = snapshot.val();
  doam2.push({ value: damdat, timestamp: new Date().getTime() });
  document.getElementById("doam2").innerHTML = damdat;
  console.log("Updated doam2: " + damdat);
  humichart2.data.datasets[0].data = doam2.slice(-8).map(item => item.value);
  humichart2.data.labels = generateLabels(doam2.slice(-8));
  humichart2.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/SensorData/Warehouse2/smoke").on("value", function(snapshot) {
  var kgas2 = snapshot.val();
  khigas2.push({ value: kgas2, timestamp: new Date().getTime() });
  document.getElementById("khigas2").innerHTML = kgas2;
  console.log("Updated khigas2: " + kgas2);
  gaschart2.data.datasets[0].data = khigas2.slice(-8).map(item => item.value);
  gaschart2.data.labels = generateLabels(khigas2.slice(-8));
  gaschart2.update();
  updateDataAndSaveToLocalStorage();
});


// firebase.database().ref("/SensorData/Warehouse1/smoke").on("value", function(snapshot) {
//   var smk = snapshot.val();
//   var smokeStatusElem = document.getElementById("smoke_node1");
//   var smokeNode1 = document.getElementById("smoke_node1_id");

//   if (smk === "ON") {
//       smokeStatusElem.innerHTML = "DETECTED";
//       smokeStatusElem.style.color = "red";
//       smokeNode1.classList.add("zooming2");
//       smokeStatus = "ON";
//   } else {
//       smokeStatusElem.innerHTML = "NOT DETECTED";
//       smokeStatusElem.style.color = "black";
//       smokeNode1.classList.remove("zooming2");
//       smokeStatus = "OFF";
//   }

//   console.log("khói: " + smk);
//   checkFireAndSmokeStatus();
// });


let smokeAlarmTimeout = null;
firebase.database().ref("/SensorData/Warehouse1/smoke").on("value", function(snapshot) {
  const smokeValue = snapshot.val(); // Lấy giá trị smoke từ Firebase
  const smokeStatusElem = document.getElementById("smoke_node1");
  const smokeNode1 = document.getElementById("smoke_node1_id");

  if (smokeValue !== null) {
      console.log("Giá trị smoke: " + smokeValue);

      // Kiểm tra nếu smoke > 500, cập nhật trạng thái Smoke thành DETECTED
      if (parseInt(smokeValue) == 1) {
          // Xóa timeout nếu có (không tắt báo động khi smoke lại vượt 500)
          if (smokeAlarmTimeout) {
              clearTimeout(smokeAlarmTimeout);
              smokeAlarmTimeout = null;
          }

          // Cập nhật trạng thái Smoke trên Firebase
          // firebase.database().ref("/SensorData/Warehouse1/").update({
          //     "Smoke": "DETECTED"
          // });

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
          // firebase.database().ref("/SensorData/Warehouse1/").update({
          //     "Smoke": "NOT DETECTED"
          // });

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

let alarmTimeout = null; // Biến để quản lý timeout

// Lắng nghe giá trị cảm biến flame từ Firebase
firebase.database().ref("/SensorData/Warehouse1/flame").on("value", function(snapshot) {
    const flameValue = snapshot.val(); // Lấy giá trị flame từ Firebase
    const fireStatusElem = document.getElementById("fire_node1");
    const fireNode1 = document.getElementById("firesensor_node1_id");

    if (flameValue !== null) {
        console.log("Giá trị flame: " + flameValue);

        // Kiểm tra nếu flame > 500, cập nhật trạng thái fire thành DETECTED
        if (parseInt(flameValue)  == 1) {
            // Xóa timeout nếu có (không tắt báo động khi flame lại vượt 500)
            if (alarmTimeout) {
                clearTimeout(alarmTimeout);
                alarmTimeout = null;
            }

            // Cập nhật trạng thái fire trên Firebase
            // firebase.database().ref("/SensorData/Warehouse1/").update({
            //     "fire": "DETECTED"
            // });

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
            // firebase.database().ref("/SensorData/Warehouse1/").update({
            //     "fire": "NOT DETECTED"
            // });

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


// firebase.database().ref("/SensorData/Warehouse1/flame").on("value", function(snapshot) {
//   var fire = snapshot.val();
//   var fireStatusElem = document.getElementById("fire_node1");
//   var fireNode1 = document.getElementById("firesensor_node1_id");

//   if (fire === "ON") {
//       fireStatusElem.innerHTML = "DETECTED";
//       fireStatusElem.style.color = "red";
//       fireNode1.classList.add("zooming1");
//       fireStatus = "ON";  
//   } else {
//       fireStatusElem.innerHTML = "NOT DETECTED";
//       fireStatusElem.style.color = "black";
//       fireNode1.classList.remove("zooming1");
//       fireStatus = "OFF";

//   console.log("lửa: " + fire);
//   checkFireAndSmokeStatus();
// }
// });


let fireAlarmTimeout2 = null;
let smokeAlarmTimeout2 = null;

// Lắng nghe giá trị cảm biến lửa từ Firebase (WareHouse2)
firebase.database().ref("/SensorData/Warehouse2/flame").on("value", function(snapshot) {
    const fireValue2 = snapshot.val();
    const fireStatusElem2 = document.getElementById("fire_node2");
    const fireNode2 = document.getElementById("firesensor_node2_id");

    if (fireValue2 !== null) {
        console.log("Giá trị lửa (WareHouse2): " + fireValue2);

        // Nếu giá trị lửa vượt ngưỡng 500
        if (parseInt(fireValue2)  == 1) {
            if (fireAlarmTimeout2) {
                clearTimeout(fireAlarmTimeout2); // Hủy bỏ timeout nếu đang chạy
                fireAlarmTimeout2 = null;
            }

            // firebase.database().ref("/SensorData/Warehouse2/").update({
            //     "Fire": "DETECTED"
            // });

            fireStatusElem2.innerHTML = "DETECTED";
            fireStatusElem2.style.color = "red";
            fireNode2.classList.add("zooming1");

            if (typeof triggerFireAlarm === "function") {
                triggerFireAlarm();
            }
        } else {
            // firebase.database().ref("/SensorData/Warehouse2/").update({
            //     "Fire": "NOT DETECTED"
            // });

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
firebase.database().ref("/SensorData/Warehouse2/smoke").on("value", function(snapshot) {
    const smokeValue2 = snapshot.val();
    const smokeStatusElem2 = document.getElementById("smoke_node2");
    const smokeNode2 = document.getElementById("smoke_node2_id");

    if (smokeValue2 !== null) {
        console.log("Giá trị khói (WareHouse2): " + smokeValue2);

        if (parseInt(smokeValue2)  == 1) {
            if (smokeAlarmTimeout2) {
                clearTimeout(smokeAlarmTimeout2);
                smokeAlarmTimeout2 = null;
            }

            // firebase.database().ref("/SensorData/Warehouse2/").update({
            //     "Smoke": "DETECTED"
            // });

            smokeStatusElem2.innerHTML = "DETECTED";
            smokeStatusElem2.style.color = "red";
            smokeNode2.classList.add("zooming2");

            if (typeof triggerFireAlarm === "function") {
                triggerFireAlarm();
            }
        } else {
            // firebase.database().ref("/SensorData/Warehouse2/").update({
            //     "Smoke": "NOT DETECTED"
            // });

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
initializeData();