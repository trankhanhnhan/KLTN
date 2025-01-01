import torch
from ultralytics import YOLO
import onnx
import onnxruntime

# 1. Tải mô hình PyTorch từ tệp .pt
print("Đang tải mô hình từ best.pt...")
model = YOLO('best.pt')  # Thay 'best.pt' bằng đường dẫn tới mô hình của bạn
model.model.eval()  # Chuyển sang chế độ đánh giá

# 2. Định nghĩa đầu vào giả lập
print("Định nghĩa đầu vào giả lập...")
dummy_input = torch.randn(1, 3, 640, 640)  # Batch size 1, 3 kênh màu, kích thước 640x640

# 3. Xuất mô hình sang định dạng ONNX
onnx_path = "best.onnx"  # Đường dẫn lưu tệp ONNX
print(f"Đang xuất mô hình sang {onnx_path}...")
torch.onnx.export(
    model.model,          # Mô hình PyTorch
    dummy_input,          # Đầu vào giả lập
    onnx_path,            # Đường dẫn tệp ONNX
    opset_version=11,     # Phiên bản opset (thường dùng 11 hoặc 13)
    input_names=["input"],# Tên đầu vào (tùy chọn)
    output_names=["output"], # Tên đầu ra (tùy chọn)
    dynamic_axes={        # Hỗ trợ kích thước đầu vào thay đổi
        "input": {0: "batch_size", 2: "height", 3: "width"},
        "output": {0: "batch_size"}
    }
)

print("Xuất mô hình ONNX thành công!")

# 4. Kiểm tra mô hình ONNX
print("Đang kiểm tra tính hợp lệ của mô hình ONNX...")
onnx_model = onnx.load(onnx_path)  # Tải mô hình ONNX
onnx.checker.check_model(onnx_model)  # Kiểm tra hợp lệ

print("Mô hình ONNX hợp lệ!")

# 5. Chạy thử nghiệm với ONNX Runtime
print("Đang chạy thử nghiệm với ONNX Runtime...")
ort_session = onnxruntime.InferenceSession(onnx_path)

# Tạo đầu vào giả lập cho ONNX Runtime
inputs = {"input": dummy_input.numpy()}  # Chuyển đầu vào sang NumPy
outputs = ort_session.run(None, inputs)  # Chạy suy luận

print("Chạy thử nghiệm ONNX Runtime thành công!")
print(f"Đầu ra của mô hình ONNX: {outputs[0].shape}")
