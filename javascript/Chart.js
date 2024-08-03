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
var doamkk = [];
var khigas = [];
var nhietdokk = [];
var doamdat = [];
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
      data: doamkk,
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
      data: nhietdokk,
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
      data: doamdat,
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
  localStorage.setItem('doamkk_history', JSON.stringify(doamkk));
  localStorage.setItem('khigas_history', JSON.stringify(khigas));
  localStorage.setItem('nhietdokk_history', JSON.stringify(nhietdokk));
  localStorage.setItem('doamdat_history', JSON.stringify(doamdat));
  localStorage.setItem('khigas2_history', JSON.stringify(khigas2));
}

function getDataFromLocalStorage() {
  nhietdo = JSON.parse(localStorage.getItem('nhietdo_history')) || [];
  doamkk = JSON.parse(localStorage.getItem('doamkk_history')) || [];
  khigas = JSON.parse(localStorage.getItem('khigas_history')) || [];
  nhietdokk = JSON.parse(localStorage.getItem('nhietdokk_history')) || [];
  doamdat = JSON.parse(localStorage.getItem('doamdat_history')) || [];
  khigas2 = JSON.parse(localStorage.getItem('khigas2_history')) || [];
}

function updateDataAndSaveToLocalStorage() {
  saveDataToLocalStorage();
}

getDataFromLocalStorage();

function initializeData() {
  firebase.database().ref("/LivingRoom/nhietdo").once("value", function(snapshot) {
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
  
  firebase.database().ref("/LivingRoom/doamkk").once("value", function(snapshot) {
      var damkk = snapshot.val();
      if (damkk !== null) {
          doamkk.push({ value: damkk, timestamp: new Date().getTime() });
          document.getElementById("doamkk").innerHTML = damkk;
          console.log("Initial doamkk: " + damkk);
          humichart.data.datasets[0].data = doamkk.slice(-8).map(item => item.value);
          humichart.data.labels = generateLabels(doamkk.slice(-8));
          humichart.update();
          updateDataAndSaveToLocalStorage();
      }
  });
  
  firebase.database().ref("/LivingRoom/khigas").once("value", function(snapshot) {
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

  firebase.database().ref("/Garden/nhietdokk").once("value", function(snapshot) {
      var ndkk = snapshot.val();
      if (ndkk !== null) {
          nhietdokk.push({ value: ndkk, timestamp: new Date().getTime() });
          document.getElementById("nhietdokk").innerHTML = ndkk;
          console.log("Initial nhietdokk: " + ndkk);
          tempchart2.data.datasets[0].data = nhietdokk.slice(-8).map(item => item.value);
          tempchart2.data.labels = generateLabels(nhietdokk.slice(-8));
          tempchart2.update();
          updateDataAndSaveToLocalStorage();
      }
  });

  firebase.database().ref("/Garden/doamdat").once("value", function(snapshot) {
      var damdat = snapshot.val();
      if (damdat !== null) {
          doamdat.push({ value: damdat, timestamp: new Date().getTime() });
          document.getElementById("doamdat").innerHTML = damdat;
          console.log("Initial doamdat: " + damdat);
          humichart2.data.datasets[0].data = doamdat.slice(-8).map(item => item.value);
          humichart2.data.labels = generateLabels(doamdat.slice(-8));
          humichart2.update();
          updateDataAndSaveToLocalStorage();
      }
  });

  firebase.database().ref("/Garden/khigas2").once("value", function(snapshot) {
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

firebase.database().ref("/LivingRoom/nhietdo").on("value", function(snapshot) {
  var nd = snapshot.val();
  nhietdo.push({ value: nd, timestamp: new Date().getTime() });
  document.getElementById("nhietdo").innerHTML = nd;
  console.log("Updated nhietdo: " + nd);
  tempchart.data.datasets[0].data = nhietdo.slice(-8).map(item => item.value);
  tempchart.data.labels = generateLabels(nhietdo.slice(-8));
  tempchart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/LivingRoom/doamkk").on("value", function(snapshot) {
  var damkk = snapshot.val();
  doamkk.push({ value: damkk, timestamp: new Date().getTime() });
  document.getElementById("doamkk").innerHTML = damkk;
  console.log("Updated doamkk: " + damkk);
  humichart.data.datasets[0].data = doamkk.slice(-8).map(item => item.value);
  humichart.data.labels = generateLabels(doamkk.slice(-8));
  humichart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/LivingRoom/khigas").on("value", function(snapshot) {
  var kgas = snapshot.val();
  khigas.push({ value: kgas, timestamp: new Date().getTime() });
  document.getElementById("khigas").innerHTML = kgas;
  console.log("Updated khigas: " + kgas);
  gaschart.data.datasets[0].data = khigas.slice(-8).map(item => item.value);
  gaschart.data.labels = generateLabels(khigas.slice(-8));
  gaschart.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/Garden/nhietdokk").on("value", function(snapshot) {
  var ndkk = snapshot.val();
  nhietdokk.push({ value: ndkk, timestamp: new Date().getTime() });
  document.getElementById("nhietdokk").innerHTML = ndkk;
  console.log("Updated nhietdokk: " + ndkk);
  tempchart2.data.datasets[0].data = nhietdokk.slice(-8).map(item => item.value);
  tempchart2.data.labels = generateLabels(nhietdokk.slice(-8));
  tempchart2.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/Garden/doamdat").on("value", function(snapshot) {
  var damdat = snapshot.val();
  doamdat.push({ value: damdat, timestamp: new Date().getTime() });
  document.getElementById("doamdat").innerHTML = damdat;
  console.log("Updated doamdat: " + damdat);
  humichart2.data.datasets[0].data = doamdat.slice(-8).map(item => item.value);
  humichart2.data.labels = generateLabels(doamdat.slice(-8));
  humichart2.update();
  updateDataAndSaveToLocalStorage();
});

firebase.database().ref("/Garden/khigas2").on("value", function(snapshot) {
  var kgas2 = snapshot.val();
  khigas2.push({ value: kgas2, timestamp: new Date().getTime() });
  document.getElementById("khigas2").innerHTML = kgas2;
  console.log("Updated khigas2: " + kgas2);
  gaschart2.data.datasets[0].data = khigas2.slice(-8).map(item => item.value);
  gaschart2.data.labels = generateLabels(khigas2.slice(-8));
  gaschart2.update();
  updateDataAndSaveToLocalStorage();
});

initializeData();