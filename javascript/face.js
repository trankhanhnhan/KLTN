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