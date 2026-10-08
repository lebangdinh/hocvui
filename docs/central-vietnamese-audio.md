# Học Vui – bộ giọng nữ miền Nam mặc định

Website dùng giọng **Yến Nhi (femalesouth-01, speaker ID 4)** từ mô hình [CakeByVPBank Piper v3/Vietnamese multi-speaker](https://huggingface.co/CakeByVPBank/piper-pgl-v4-vi_VN-version39_epoch39). Model card công bố giọng Yến Nhi là nữ miền Nam; giấy phép mô hình **MIT**.

## Tích hợp

- Khi GitHub Actions build, tải ONNX 5-speaker (SHA-256 cố định), synthesize 8 câu khen chỉ bằng speaker ID 4 và xuất MP3 nhẹ, âm lượng -22 LUFS.
- Các file MP3 nằm trong `public/audio/vi-south/` khi build, và `/hocvui/audio/vi-south/` sau khi phát hành. Không có file ONNX hoặc khóa API nào gửi xuống máy bé.
- Cài đặt **Tự động** và **Cô Yến Nhi – nữ miền Nam** đều chọn sẵn 8 đoạn MP3 này. Người dùng từng chọn giọng Piper cũ `piper-vi` tự chuyển sang giọng miền Nam tương thích.
- Nếu máy có giọng vi-VN khác, có thể chủ động chọn từ danh sách giọng của thiết bị.
- Các công tắc nhạc, hiệu ứng, giọng khen và đọc giải thích hoạt động độc lập; nhạc nền tắt mặc định, hiệu ứng âm lượng thấp.
- Đọc giải thích tự do dài vẫn phụ thuộc danh sách giọng vi-VN trên thiết bị; hiện chưa có máy chủ TTS để tạo mọi câu dài.

## Nguồn và giấy phép

- Mô hình giọng nhiều speaker: https://huggingface.co/CakeByVPBank/piper-pgl-v4-vi_VN-version39_epoch39
- Speaker ID 4: Yến Nhi, female southern. Source labels this speaker as `femalesouth-01`.
- Model license: MIT, see model card. Attribution bundled at `/hocvui/audio/vi-south/ATTRIBUTION.txt`.
- Piper: https://github.com/OHF-Voice/piper1-gpl

## Bộ MP3 giọng miền Trung (tùy chọn, không bắt buộc)

Nếu sau này cần một giọng Mỹ An miền Trung đồng nhất, có thể tạo thêm bộ `vi-central` với API key FPT.AI lưu trong GitHub Secrets, sau khi kiểm tra quyền phân phối. Chế độ này hiện chưa được kích hoạt; không ảnh hưởng giọng Yến Nhi mặc định.
