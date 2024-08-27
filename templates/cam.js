// Đảm bảo trình duyệt hỗ trợ getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Yêu cầu truy cập video
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            // Lấy phần tử video
            var video = document.getElementById('stream');
            // Đặt nguồn video là stream từ camera
            video.srcObject = stream;
        })
        .catch(function (error) {
            console.error('Lỗi khi truy cập camera: ', error);
        });
} else {
    alert('Trình duyệt không hỗ trợ getUserMedia.');
}
