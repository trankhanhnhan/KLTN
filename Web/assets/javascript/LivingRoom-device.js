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
    
  //-------------------AUTO LOAD SENSOR-------------------------
    firebase.database().ref("/LivingRoom/nhietdo").on("value",function(snapshot){
      var nd = snapshot.val();  
      document.getElementById("nhietdo").innerHTML = nd;
      console.log("nhiệt độ: " + nd);
    });
    
    firebase.database().ref("/LivingRoom/doamkk").on("value",function(snapshot){
      var da = snapshot.val();  
      document.getElementById("doamkk").innerHTML = da;
      console.log("độ ẩm: " + da);
    });
  
    firebase.database().ref("/LivingRoom/khigas").on("value",function(snapshot){
      var gas = snapshot.val();  
      document.getElementById("khigas").innerHTML = gas;
      console.log("khí gas: " + gas);
    });
    
 //----------------CONNECT LIGHT TO FIREBASE-----------------
firebase.database().ref("/LivingRoom/light").on("value", function(snapshot) {
  if (snapshot.exists()) {
      console.log(snapshot.val());
      var lightStatus = snapshot.val();
      var lightInput = document.getElementById("light");
      var textLight = document.getElementById("textlight");

      if (lightInput && textLight) {
          lightInput.checked = (lightStatus === "ON");
          textLight.textContent = lightStatus;
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
      firebase.database().ref("/LivingRoom").update({
          "light": lightState
      });
      var textLight = document.getElementById("textlight");
      if (textLight) {
          textLight.textContent = lightState;
      }
  });
}

//----------------CONNECT FAN TO FIREBASE-----------------
firebase.database().ref("/LivingRoom/fan").on("value", function(snapshot) {
  if (snapshot.exists()) {
      console.log(snapshot.val());
      var fanStatus = snapshot.val();
      var fanInput = document.getElementById("fan");
      var textFan = document.getElementById("textfan");

      if (fanInput && textFan) {
          fanInput.checked = (fanStatus === "ON");
          textFan.textContent = fanStatus;
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
      firebase.database().ref("/LivingRoom").update({
          "fan": fanState
      });
      var textFan = document.getElementById("textfan");
      if (textFan) {
          textFan.textContent = fanState;
      }
  });
}
