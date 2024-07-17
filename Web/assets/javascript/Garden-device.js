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
    
    
    //------------------------AUTO LOAD SENSOR-------------------------
    firebase.database().ref("/Garden/nhietdokk").on("value",function(snapshot){
      var nd = snapshot.val();  
      document.getElementById("nhietdokk").innerHTML = nd;
      console.log("nhiệt độ: " + nd);
    });
    
    firebase.database().ref("/Garden/doamdat").on("value",function(snapshot){
      var da = snapshot.val();  
      document.getElementById("doamdat").innerHTML = da;
      console.log("độ ẩm: " + da);
    });
  
    firebase.database().ref("/Garden/khigas").on("value",function(snapshot){
      var gas = snapshot.val();  
      document.getElementById("khigas").innerHTML = gas;
      console.log("khí gas: " + gas);
    });
    
   //----------------CONNECT LIGHT TO FIREBASE-----------------
firebase.database().ref("/Garden/light").on("value", function(snapshot) {
  if (snapshot.exists()) {
      console.log(snapshot.val());
      var lightStatus = snapshot.val();
      var lightInput = document.getElementById("gardenlight");
      var textGLight = document.getElementById("textGlight");

      if (lightInput && textGLight) {
          lightInput.checked = (lightStatus === "ON");
          textGLight.textContent = lightStatus;
      }
  } else {
      console.log("No data available for light!");
  }
});

//-----------------CONTROL LIGHT FROM THE WEB----------------------
var lightInput = document.getElementById('gardenlight');
if (lightInput) {
  lightInput.addEventListener('change', function() {
      var lightState = this.checked ? "ON" : "OFF";
      firebase.database().ref("/Garden").update({
          "light": lightState
      });
      var textGLight = document.getElementById("textGlight");
      if (textGLight) {
          textGLight.textContent = lightState;
      }
  });
}

//----------------CONNECT FAN TO FIREBASE-----------------
firebase.database().ref("/Garden/fan").on("value", function(snapshot) {
  if (snapshot.exists()) {
      console.log(snapshot.val());
      var fanStatus = snapshot.val();
      var fanInput = document.getElementById("gardenfan");
      var textGFan = document.getElementById("textGfan");

      if (fanInput && textGFan) {
          fanInput.checked = (fanStatus === "ON");
          textGFan.textContent = fanStatus;
      }
  } else {
      console.log("No data available for fan!");
  }
});

//-----------------CONTROL FAN FROM THE WEB----------------------
var fanInput = document.getElementById('gardenfan');
if (fanInput) {
  fanInput.addEventListener('change', function() {
      var fanState = this.checked ? "ON" : "OFF";
      firebase.database().ref("/Garden").update({
          "fan": fanState
      });
      var textGFan = document.getElementById("textGfan");
      if (textGFan) {
          textGFan.textContent = fanState;
      }
  });
}
              
