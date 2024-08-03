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

//-----------------TOAST MESSAGE----------------------
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
            errorEmail: "fas fa-exclamation-circle",
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

//--------Handle the event when submitting the password change form----------
document.getElementById('reset-password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const emailErrorMessage = document.getElementById('email-error-message');
    const ErrorMessage = document.getElementById('error-message');
    const passwordErrorMessage = document.getElementById('password-error-message');

    emailErrorMessage.textContent = '';
    ErrorMessage.textContent = '';
    passwordErrorMessage.textContent = '';

    let isValid = true;

    if (!email) {
        emailErrorMessage.textContent = "Vui lòng nhập email.";
        isValid = false;
    }

    if (password.length < 6) {
        passwordErrorMessage.textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
        isValid = false;
    }

    if (password !== confirmPassword) {
        passwordErrorMessage.textContent = "Mật khẩu và xác nhận mật khẩu không khớp.";
        isValid = false;
    }

    if (!isValid) {
        return;
    }

//-------Check if the email exists in the system or not------
    firebase.auth().fetchSignInMethodsForEmail(email)
        .then((signInMethods) => {
            if (signInMethods.length === 0) {
                showErrorEmailToast();
            } else {
                const user = firebase.auth().currentUser;

                if (user) {
                    user.updatePassword(password).then(() => {
                        showSuccessToast();
                        sessionStorage.setItem('resetPasswordEmail', email);
                        sessionStorage.setItem('resetPasswordPassword', password);
                        setTimeout(() => {
                            window.location.href = './index.html';
                        }, 3000);
                    }).catch((error) => {
                        console.error("Lỗi cập nhật mật khẩu mới:", error);
                        showErrorToast(error.message);
                    });
                } else {
                    firebase.auth().signInWithEmailAndPassword(email, password)
                        .then(() => {
                            const user = firebase.auth().currentUser;
                            return user.updatePassword(password);
                        })
                        .catch((error) => {
                            console.error("Lỗi đăng nhập và cập nhật mật khẩu mới:", error);
                            showErrorToast(error.message);
                        });
                }
            }
        })
        .catch((error) => {
            console.error("Lỗi kiểm tra phương thức đăng nhập:", error);
            showErrorToast(error.message);
        });
});
//-----------------AUTO-FILL----------------------
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
const togglePassword1 = document.getElementById('toggleIcon1');
const togglePassword2 = document.getElementById('toggleIcon2');
const passwordInput = document.getElementById('password');
const comfirmpasswordInput = document.getElementById('confirm-password');

togglePassword1.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');

  });
togglePassword2.addEventListener('click', function () {
  const type = comfirmpasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  comfirmpasswordInput.setAttribute('type', type);

  this.classList.toggle('fa-eye');
  this.classList.toggle('fa-eye-slash');
  });