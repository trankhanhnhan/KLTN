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

const gaschart = new Chart(gasChartCanvas, {
  type: 'line',
  data: {
    labels: initialLabels,
    datasets: [{
      label: 'CO2',
      data: khigas,
      borderColor: 'orange',
      backgroundColor: 'rgba(250, 232, 198, 0.8)',
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

const gaschart2 = new Chart(gasChartCanvas2, {
  type: 'line',
  data: {
    labels: initialLabels,
    datasets: [{
      label: 'CO2',
      data: khigas2,
      borderColor: 'orange',
      backgroundColor: 'rgba(250, 232, 198, 0.8)',
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

function initializeData() {
  firebase.database().ref("/KLTN/Device/WareHouse1/nhietdo").once("value", function(snapshot) {
      var nd = snapshot.val();
      if (nd !== null) {
          nhietdo.push({ value: nd, timestamp: new Date().getTime() });
          document.getElementById("nhietdo").innerHTML = nd;
          console.log("Initial nhietdo: " + nd);
          tempchart.data.datasets[0].data = nhietdo.slice(-8).map(item => item.value);
          tempchart.data.labels = generateLabels(nhietdo.slice(-8));
          tempchart.update();
          updateDataAndSaveToLocalStorage();
      }
  });
  
  firebase.database().ref("/KLTN/Device/WareHouse1/doam").once("value", function(snapshot) {
      var damkk = snapshot.val();
      if (damkk !== null) {
          doam.push({ value: damkk, timestamp: new Date().getTime() });
          document.getElementById("doam").innerHTML = damkk;
          console.log("Initial doam: " + damkk);
          humichart.data.datasets[0].data = doam.slice(-8).map(item => item.value);
          humichart.data.labels = generateLabels(doam.slice(-8));
          humichart.update();
          updateDataAndSaveToLocalStorage();
      }
  });
  
  firebase.database().ref("/KLTN/Device/WareHouse1/khigas").once("value", function(snapshot) {
      var kgas = snapshot.val();
      if (kgas !== null) {
          khigas.push({ value: kgas, timestamp: new Date().getTime() });
          document.getElementById("khigas").innerHTML = kgas;
          console.log("Initial khigas: " + kgas);
          gaschart.data.datasets[0].data = khigas.slice(-8).map(item => item.value);
          gaschart.data.labels = generateLabels(khigas.slice(-8));
          gaschart.update();
          updateDataAndSaveToLocalStorage();
      }
  });

  firebase.database().ref("/KLTN/Device/WareHouse2/nhietdo").once("value", function(snapshot) {
      var ndkk = snapshot.val();
      if (ndkk !== null) {
          nhietdo2.push({ value: ndkk, timestamp: new Date().getTime() });
          document.getElementById("nhietdo2").innerHTML = ndkk;
          console.log("Initial nhietdo2: " + ndkk);
          tempchart2.data.datasets[0].data = nhietdo2.slice(-8).map(item => item.value);
          tempchart2.data.labels = generateLabels(nhietdo2.slice(-8));
          tempchart2.update();
          updateDataAndSaveToLocalStorage();
      }
  });

  firebase.database().ref("/KLTN/Device/WareHouse2/doam2").once("value", function(snapshot) {
      var damdat = snapshot.val();
      if (damdat !== null) {
          doam2.push({ value: damdat, timestamp: new Date().getTime() });
          document.getElementById("doam2").innerHTML = damdat;
          console.log("Initial doam2: " + damdat);
          humichart2.data.datasets[0].data = doam2.slice(-8).map(item => item.value);
          humichart2.data.labels = generateLabels(doam2.slice(-8));
          humichart2.update();
          updateDataAndSaveToLocalStorage();
      }
  });

  firebase.database().ref("/KLTN/Device/WareHouse2/khigas2").once("value", function(snapshot) {
      var kgas2 = snapshot.val();
      if (kgas2 !== null) {
          khigas2.push({ value: kgas2, timestamp: new Date().getTime() });
          document.getElementById("khigas2").innerHTML = kgas2;
          console.log("Initial khigas2: " + kgas2);
          gaschart2.data.datasets[0].data = khigas2.slice(-8).map(item => item.value);
          gaschart2.data.labels = generateLabels(khigas2.slice(-8));
          gaschart2.update();
          updateDataAndSaveToLocalStorage();
      }
  });
}

function generateLabels(data) {
  return data.map(item => new Date(item.timestamp).toLocaleTimeString());
}

firebase.database().ref("/KLTN/Device/WareHouse1/nhietdo").on("value", function(snapshot) {
  var nd = snapshot.val();
  nhietdo.push({ value: nd, timestamp: new Date().getTime() });
  document.getElementById("nhietdo").innerHTML = nd;
  console.log("Updated nhietdo: " + nd);
  tempchart.data.datasets[0].data = nhietdo.slice(-8).map(item => item.value);
  tempchart.data.labels = generateLabels(nhietdo.slice(-8));
  tempchart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/KLTN/Device/WareHouse1/doam").on("value", function(snapshot) {
  var damkk = snapshot.val();
  doam.push({ value: damkk, timestamp: new Date().getTime() });
  document.getElementById("doam").innerHTML = damkk;
  console.log("Updated doam: " + damkk);
  humichart.data.datasets[0].data = doam.slice(-8).map(item => item.value);
  humichart.data.labels = generateLabels(doam.slice(-8));
  humichart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/KLTN/Device/WareHouse1/khigas").on("value", function(snapshot) {
  var kgas = snapshot.val();
  khigas.push({ value: kgas, timestamp: new Date().getTime() });
  document.getElementById("khigas").innerHTML = kgas;
  console.log("Updated khigas: " + kgas);
  gaschart.data.datasets[0].data = khigas.slice(-8).map(item => item.value);
  gaschart.data.labels = generateLabels(khigas.slice(-8));
  gaschart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/KLTN/Device/WareHouse2/nhietdo").on("value", function(snapshot) {
  var ndkk = snapshot.val();
  nhietdo2.push({ value: ndkk, timestamp: new Date().getTime() });
  document.getElementById("nhietdo2").innerHTML = ndkk;
  console.log("Updated nhietdo2: " + ndkk);
  tempchart2.data.datasets[0].data = nhietdo2.slice(-8).map(item => item.value);
  tempchart2.data.labels = generateLabels(nhietdo2.slice(-8));
  tempchart2.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/KLTN/Device/WareHouse2/doam").on("value", function(snapshot) {
  var damdat = snapshot.val();
  doam2.push({ value: damdat, timestamp: new Date().getTime() });
  document.getElementById("doam2").innerHTML = damdat;
  console.log("Updated doam2: " + damdat);
  humichart2.data.datasets[0].data = doam2.slice(-8).map(item => item.value);
  humichart2.data.labels = generateLabels(doam2.slice(-8));
  humichart2.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/KLTN/Device/WareHouse2/khigas2").on("value", function(snapshot) {
  var kgas2 = snapshot.val();
  khigas2.push({ value: kgas2, timestamp: new Date().getTime() });
  document.getElementById("khigas2").innerHTML = kgas2;
  console.log("Updated khigas2: " + kgas2);
  gaschart2.data.datasets[0].data = khigas2.slice(-8).map(item => item.value);
  gaschart2.data.labels = generateLabels(khigas2.slice(-8));
  gaschart2.update();
  updateDataAndSaveToLocalStorage();
});


firebase.database().ref("/KLTN/Device/WareHouse1/smoke").on("value", function(snapshot) {
  var smk = snapshot.val();
  var smokeStatusElem = document.getElementById("smoke_node1");
  var smokeNode1 = document.getElementById("smoke_node1_id");

  if (smk === "ON") {
      smokeStatusElem.innerHTML = "DETECTED";
      smokeStatusElem.style.color = "red";
      smokeNode1.classList.add("zooming2");
      smokeStatus = "ON";
  } else {
      smokeStatusElem.innerHTML = "NOT DETECTED";
      smokeStatusElem.style.color = "black";
      smokeNode1.classList.remove("zooming2");
      smokeStatus = "OFF";
  }

  console.log("khói: " + smk);
  checkFireAndSmokeStatus();
});

firebase.database().ref("/KLTN/Device/WareHouse1/fire").on("value", function(snapshot) {
  var fire = snapshot.val();
  var fireStatusElem = document.getElementById("fire_node1");
  var fireNode1 = document.getElementById("firesensor_node1_id");

  if (fire === "ON") {
      fireStatusElem.innerHTML = "DETECTED";
      fireStatusElem.style.color = "red";
      fireNode1.classList.add("zooming1");
      fireStatus = "ON";  
  } else {
      fireStatusElem.innerHTML = "NOT DETECTED";
      fireStatusElem.style.color = "black";
      fireNode1.classList.remove("zooming1");
      fireStatus = "OFF";

  console.log("lửa: " + fire);
  checkFireAndSmokeStatus();
}
});


firebase.database().ref("/KLTN/Device/WareHouse2/smoke").on("value", function(snapshot) {
  var smk2 = snapshot.val();
  var smokeStatusElem2 = document.getElementById("smoke_node2");
  var smokeNode2 = document.getElementById("smoke_node2_id");

  if (smk2 === "ON") {
      smokeStatusElem2.innerHTML = "DETECTED";
      smokeStatusElem2.style.color = "red";
      smokeNode2.classList.add("zooming2");
      smokeStatus2 = "ON";
  } else {
      smokeStatusElem2.innerHTML = "NOT DETECTED";
      smokeStatusElem2.style.color = "black";
      smokeNode2.classList.remove("zooming2");
      smokeStatus2 = "OFF";
  }

  console.log("khói: " + smk2);
  checkFireAndSmokeStatus();
});

firebase.database().ref("/KLTN/Device/WareHouse2/fire").on("value", function(snapshot) {
  var fire2 = snapshot.val();
  var fireStatusElem2 = document.getElementById("fire_node2");
  var fireNode2 = document.getElementById("firesensor_node2_id");

  if (fire2 === "ON") {
      fireStatusElem2.innerHTML = "DETECTED";
      fireStatusElem2.style.color = "red";
      fireNode2.classList.add("zooming1");
      fireStatus2 = "ON";  
  } else {
      fireStatusElem2.innerHTML = "NOT DETECTED";
      fireStatusElem2.style.color = "black";
      fireNode2.classList.remove("zooming1");
      fireStatus2 = "OFF";

  console.log("lửa: " + fire);
  checkFireAndSmokeStatus();
}
});

initializeData();