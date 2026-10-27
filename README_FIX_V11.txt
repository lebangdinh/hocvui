BẢN VÁ GITHUB ACTIONS – HỌC VUI V11

Chỉ cần ghi đè 4 file (giữ nguyên cấu trúc thư mục):
- scripts/validate-bank.cjs
- scripts/test-bank-runtime.cjs
- scripts/test-games-and-sound.cjs
- .github/workflows/generate-central-voice.yml

NGUYÊN NHÂN VÀ SỬA CHỮA
1. Bài kiểm thử cũ bắt mọi lượt có đủ 8 câu, trái với cơ chế không lặp đoạn đọc/cùng khái niệm của V11. Bản vá kiểm tra hết nhóm kiến thức thực sự mới rồi dừng, cho phép lượt cuối có ít hơn 8 câu.
2. test-bank-runtime.cjs còn gọi test-ai-screening.cjs đã bị xóa trong V11. Thay bằng test-v11-acceptance.cjs và dừng khi bài kiểm thử trước thất bại.
3. test-games-and-sound.cjs vẫn đọc workflow V5 đã loại; chuyển sang V11.
4. Workflow tạo giọng đọc vẫn kích hoạt V5; chuyển sang V11.
5. Cập nhật mốc kiểm thử Toán về 24.450 phép tính độc lập của bộ sinh V11 (đã xác minh bằng chạy thực tế).

CẬP NHẬT BẰNG GITHUB DESKTOP
1. Giải nén bản vá; mở thư mục repo hocvui (Show in Explorer).
2. Sao chép hai thư mục scripts và .github từ bản vá vào thư mục hocvui, chọn Replace files.
3. Xác minh trong GitHub Desktop chỉ có 4 file Changed; không đưa README_FIX_V11.txt vào repo cũng được.
4. Summary: Fix V11 CI tests and stale workflow references.
5. Commit to main -> Push origin -> GitHub Actions.

ĐÃ CHẠY: npm run test:offline (với tsc shim vì môi trường này thiếu @types), test-v11-acceptance, test-current-mixed-rotation, test-v11-navigation, test-games-and-sound, check-v11-clean.
CHƯA XÁC NHẬN: build website đầy đủ trên môi trường GitHub; cần xem kết quả Actions sau khi đẩy bản vá.

Bản vá không thay ngân hàng câu hỏi, dữ liệu Firebase, mã UI hay thuật toán chọn câu.
