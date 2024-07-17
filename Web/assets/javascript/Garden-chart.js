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

var nhietdokk = [];
var doamdat = [];
var khigas2 = [];
var previousNhietDo = null;
var previousDoAmKK = null;
var previousKhiGas = null;
var updateInterval = null;

const initialLabels = ['Initial'];
const tempchart = new Chart(temperatureChartCanvas, {
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
          stepSize: 20
        }
      }
    }
  }
});

let humichart = new Chart(humidityChartCanvas, {
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

let gaschart = new Chart(gasChartCanvas, {
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

//---------------LOCAL STORAGE------------------
function saveDataToLocalStorage() {
  localStorage.setItem('nhietdokk_history', JSON.stringify(nhietdokk));
  localStorage.setItem('doamdat_history', JSON.stringify(doamdat));
  localStorage.setItem('khigas2_history', JSON.stringify(khigas2));
}

function getDataFromLocalStorage() {
  nhietdokk = JSON.parse(localStorage.getItem('nhietdokk_history')) || [];
  doamdat = JSON.parse(localStorage.getItem('doamdat_history')) || [];
  khigas2 = JSON.parse(localStorage.getItem('khigas2_history')) || [];
}

function updateDataAndSaveToLocalStorage() {
  saveDataToLocalStorage();
}

getDataFromLocalStorage();

//-------------------AUTO LOAD SENSOR-------------------------
firebase.database().ref("/Garden/nhietdokk").on("value", function(snapshot) {
  var nd = snapshot.val();
  if (nd !== null) {
    if (nhietdokk.length > 0 && nhietdokk[nhietdokk.length - 1].value === nd) {
      console.log("Duplicate data, skipping update.");
      return;
    }
    nhietdokk.push({ value: nd, timestamp: new Date().getTime() });
    document.getElementById("nhietdokk").innerHTML = nd;
    console.log("nhietdokk: " + nd);
    tempchart.data.datasets[0].data = nhietdokk.slice(-8).map(item => item.value);
    tempchart.data.labels = generateLabels(nhietdokk.slice(-8));
    tempchart.update();
    updateDataAndSaveToLocalStorage();
  }
});

firebase.database().ref("/Garden/doamdat").on("value", function(snapshot) {
  var da = snapshot.val();
  if (da !== null) {
    if (doamdat.length > 0 && doamdat[doamdat.length - 1].value === da) {
      console.log("Duplicate data, skipping update.");
      return;
    }
    doamdat.push({ value: da, timestamp: new Date().getTime() });
    document.getElementById("doamdat").innerHTML = da;
    console.log("doamdat: " + da);
    humichart.data.datasets[0].data = doamdat.slice(-8).map(item => item.value);
    humichart.data.labels = generateLabels(doamdat.slice(-8));
    humichart.update();
    updateDataAndSaveToLocalStorage();
  }
});

firebase.database().ref("/Garden/khigas2").on("value", function(snapshot) {
  var gas = snapshot.val();
  if (gas !== null) {
    if (khigas2.length > 0 && khigas2[khigas2.length - 1].value === gas) {
      console.log("Duplicate data, skipping update.");
      return;
    }
    khigas2.push({ value: gas, timestamp: new Date().getTime() });
    document.getElementById("khigas2").innerHTML = gas;
    console.log("khí gas: " + gas);
    gaschart.data.datasets[0].data = khigas2.slice(-8).map(item => item.value);
    gaschart.data.labels = generateLabels(khigas2.slice(-8));
    gaschart.update();
    updateDataAndSaveToLocalStorage();
  }
});

//-----------CREATE TIMESTAMP--------------------
function generateLabels(data) {
  return data.map(item => {
    let time = new Date(item.timestamp);
    return `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
  });
}

function initializeData() {
  firebase.database().ref("/Garden/nhietdokk").once("value", function(snapshot) {
    var nd = snapshot.val();
    if (nd !== null) {
      nhietdokk.push({ value: nd, timestamp: new Date().getTime() });
      document.getElementById("nhietdokk").innerHTML = nd;
      console.log("Initial nhietdokk: " + nd);
      tempchart.data.datasets[0].data = nhietdokk.slice(-8).map(item => item.value);
      tempchart.data.labels = generateLabels(nhietdokk.slice(-8));
      tempchart.update();
      updateDataAndSaveToLocalStorage();
    }
  });

  firebase.database().ref("/Garden/doamdat").once("value", function(snapshot) {
    var da = snapshot.val();
    if (da !== null) {
      doamdat.push({ value: da, timestamp: new Date().getTime() });
      document.getElementById("doamdat").innerHTML = da;
      console.log("Initial doamdat: " + da);
      humichart.data.datasets[0].data = doamdat.slice(-8).map(item => item.value);
      humichart.data.labels = generateLabels(doamdat.slice(-8));
      humichart.update();
      updateDataAndSaveToLocalStorage();
    }
  });

  firebase.database().ref("/Garden/khigas2").once("value", function(snapshot) {
    var gas = snapshot.val();
    if (gas !== null) {
      khigas2.push({ value: gas, timestamp: new Date().getTime() });
      document.getElementById("khigas2").innerHTML = gas;
      console.log("Initial khigas2: " + gas);
      gaschart.data.datasets[0].data = khigas2.slice(-8).map(item => item.value);
      gaschart.data.labels = generateLabels(khigas2.slice(-8));
      gaschart.update();
      updateDataAndSaveToLocalStorage();
    }
  });
}

initializeData();   
