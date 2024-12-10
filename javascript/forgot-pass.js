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

//--------Handle the event when submitting the forgot password form----------
document.getElementById('forgot-password-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const emailErrorMessage = document.getElementById('email-error-message');

    emailErrorMessage.textContent = '';

    if (!email) {
        emailErrorMessage.textContent = "Vui lòng nhập email.";
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            toast({
                title: "Success!",
                message: "A password reset email has been sent. Please check your mailbox.",
                type: "success",
                duration: 5000
            });
        })
        .catch((error) => {
            console.error("Lỗi gửi email đặt lại mật khẩu:", error);
            toast({
                title: "Error!",
                message: error.message,
                type: "error",
                duration: 5000
            });
        });
});

//-----------------EYE PASSWORD----------------------
const togglePassword1 = document.getElementById('toggleIcon1');
const passwordInput = document.getElementById('password');

togglePassword1?.addEventListener('click', function () {
    const type = passwordInput?.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput?.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});