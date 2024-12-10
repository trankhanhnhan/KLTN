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

//-----------------TOAST MESSAGE----------------------
const toastContainer = document.getElementById('toast');

function toast({ title = "", message = "", type = "success", duration = 3000 }) {
  const main = document.getElementById("toast");
  if (main) {
      const toast = document.createElement("div");

      const autoRemoveId = setTimeout(function () {
          main.removeChild(toast);
      }, duration + 1000);

      toast.onclick = function (e) {
          if (e.target.closest(".toast__close")) {
              main.removeChild(toast);
              clearTimeout(autoRemoveId);
          }
      };

      const icons = {
          success: "fas fa-check-circle",
          info: "fas fa-info-circle",
          warning: "fas fa-exclamation-circle",
          error: "fas fa-exclamation-circle"
      };
      const icon = icons[type];
      const delay = (duration / 1000).toFixed(2);

      toast.classList.add("toast", `toast--${type}`);
      toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;

      toast.innerHTML = `
          <div class="toast__icon">
              <i class="${icon}"></i>
          </div>
          <div class="toast__body">
              <h3 class="toast__title">${title}</h3>
              <p class="toast__msg">${message}</p>
          </div>
          <div class="toast__close">
              <i class="fas fa-times"></i>
          </div>
      `;
      main.appendChild(toast);
  }
}
//-----------------BUTTON LOGIN----------------------
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('error-message');

  const email = emailInput.value;
  const password = passwordInput.value;

  errorMessage.textContent = '';

  //-----------------ADD TIME LOGIN TO FIREBASE----------------------
  firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
          const now = new Date();
          const loginTime = now.toString();
          const uid = userCredential.user.uid;

          console.log('Chuẩn bị thêm thời gian đăng nhập vào Realtime Database');

          firebase.database().ref("/users/" + uid).set({
              loginTime: loginTime
          }).then(() => {
              showSuccessToast();
              setTimeout(() => {
                window.location.href = './Device.html';
            }, 3000);
          });
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        showErrorToast(errorMessage);
        console.error('Lỗi đăng ký:', errorCode, errorMessage);
    });
});

//-----------------AUTO-FILL----------------------
document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  const registeredEmail = localStorage.getItem('registeredEmail');
  const registeredPassword = localStorage.getItem('registeredPassword');
  if (registeredEmail && registeredPassword) {
      emailInput.value = registeredEmail;
      passwordInput.value = registeredPassword;
      localStorage.removeItem('registeredEmail');
      localStorage.removeItem('registeredPassword');
  }
});

window.onload = function() {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const savedEmail = sessionStorage.getItem('resetPasswordEmail');
  const savedPassword = sessionStorage.getItem('resetPasswordPassword');
  if (savedEmail && savedPassword) {
      emailInput.value = savedEmail;
      passwordInput.value = savedPassword;
      sessionStorage.removeItem('resetPasswordEmail');
      sessionStorage.removeItem('resetPasswordPassword');
  }
};

//-----------------EYE PASSWORD----------------------
const togglePassword = document.getElementById('toggleIcon');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});