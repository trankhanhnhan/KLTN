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
    // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('User is logged in');
      console.log(user.uid);
      const logout = document.querySelector('#logout');
      logout.addEventListener('click', function(event) {
        event.preventDefault();
        firebase.auth().signOut().then(() => {
          // get current date and time
          const now = new Date();
          const logoutTime = now.toString();
          console.log('Logout time: ' + logoutTime);
    
          console.log('About to add logout time to Realtime Database');
          // save logout time to Realtime Database
          firebase.database().ref("/KLTN/logins/user").push({
            logoutTime: logoutTime
          });
          window.location.href = 'login.html';
        }).catch((error) => {
          console.error(error);
        });
      });
      const sidebarLogout = document.querySelector('#sidebar-logout'); // replace '#sidebar-logout' with the actual id of your sidebar logout button
      sidebarLogout.addEventListener('click', function(event) {
      event.preventDefault();
      firebase.auth().signOut().then(() => {
        // get current date and time
        const now = new Date();
        const logoutTime = now.toString();
        console.log('Logout time: ' + logoutTime);
        const user = firebase.auth().currentUser;
        if(user) {
          const uid = user.uid;
          console.log('About to add logout time to Realtime Database');
          // save logout time to Realtime Database
          firebase.database().ref("/KLTN/logins/user" + ": " + uid).push({
            logoutTime: logoutTime
          });
        }
        window.location.href = 'login.html';
      }).catch((error) => {
        console.error(error);
      });
    });
} else {
    console.log('User is not logged in');
    window.location.href = 'login.html';
  }});