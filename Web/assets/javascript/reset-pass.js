// Cấu hình Firebase
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

// Hàm hiển thị toast thông báo
function toast({ title = "", message = "", type = "success", duration = 3000 }) {
    const main = document.getElementById("toast");
    if (main) {
        const toast = document.createElement("div");

        // Tự động xóa toast
        const autoRemoveId = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        // Xóa toast khi được click
        toast.onclick = function (e) {
            if (e.target.closest(".toast__close")) {
                main.removeChild(toast);
                clearTimeout(autoRemoveId);
            }
        };

        // Biểu tượng của toast
        const icons = {
            success: "fas fa-check-circle",
            info: "fas fa-info-circle",
            errorEmail: "fas fa-exclamation-circle",
            error: "fas fa-exclamation-circle"
        };
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);

        // Thiết lập nội dung của toast
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

// Xử lý sự kiện khi submit form đổi mật khẩu
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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailErrorMessage.textContent = 'Định dạng email không đúng.';
        return;
    }

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

    // Kiểm tra xem email có tồn tại trong hệ thống hay không
    firebase.auth().fetchSignInMethodsForEmail(email)
        .then((signInMethods) => {
            if (signInMethods.length === 0) {
                showErrorEmailToast();
            } else {
                // Email tồn tại, tiến hành cập nhật mật khẩu
                const user = firebase.auth().currentUser;

                if (user) {
                    user.updatePassword(password).then(() => {
                        showSuccessToast();
                        setTimeout(() => {
                            window.location.href = './login.html'; // Chuyển hướng sau khi đổi mật khẩu thành công
                        }, 3000); // Đợi 3 giây trước khi chuyển hướng
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
                        .then(() => {
                            showSuccessToast();
                            // Lưu email và mật khẩu vào sessionStorage
                        sessionStorage.setItem('resetPasswordEmail', email);
                        sessionStorage.setItem('resetPasswordPassword', password);
                        setTimeout(() => {
                            window.location.href = './login.html'; // Chuyển hướng sau khi đổi mật khẩu thành công
                        }, 3000); // Đợi 3 giây trước khi chuyển hướng
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

// Kiểm tra nếu có email và mật khẩu được lưu trong sessionStorage
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

// Hiển thị mật khẩu khi nhấn vào biểu tượng con mắt
const togglePassword1 = document.getElementById('toggleIcon1');
const togglePassword2 = document.getElementById('toggleIcon2');
const passwordInput = document.getElementById('password');
const comfirmpasswordInput = document.getElementById('confirm-password');

togglePassword1.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    this.classList.toggle('fa-eye-slash');

  });
togglePassword2.addEventListener('click', function () {
  const type = comfirmpasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  comfirmpasswordInput.setAttribute('type', type);
  
  // Toggle eye icon
  this.classList.toggle('fa-eye-slash');
  });
