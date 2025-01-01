import onnx
import onnxruntime
from onnxruntime.quantization import quantize_dynamic, QuantType

# Đọc mô hình ONNX gốc
onnx_model_path = "best.onnx"
quantized_model_path = "best_quantized.onnx"

# Thực hiện lượng tử hóa động với INT8
quantize_dynamic(onnx_model_path, quantized_model_path, weight_type=QuantType.QInt8)

print(f"Quantized model saved to {quantized_model_path}")
