# Âm thanh Học Vui – giọng tiếng Việt không cần API key

## Đã tích hợp trên web

- Học Vui dò danh sách giọng **vi-VN thực sự có trên thiết bị** bằng Web Speech API.
- Khi có nhiều giọng, tự ưu tiên Hoài My (nữ) hoặc các giọng có dấu hiệu tự nhiên; có danh sách chọn giọng và nút **Nghe thử giọng**.
- Lời khen chỉ gồm 8 câu ngắn, tốc độ chậm vừa, âm lượng tối đa 45%. Không chọn nhầm tiếng Anh để đọc tiếng Việt.
- Máy không có giọng Việt: vẫn hiển thị lời khen bằng chữ và dùng tín hiệu nhẹ, không giả vờ là tiếng Việt hoặc âm thanh giọng miền Trung.
- Các âm báo trong game/bài học được tạo tại chỗ bằng Web Audio với sóng sin dịu, không còn cần MP3 hiệu ứng bên ngoài.
- Nhạc nền tắt mặc định. Lời khen, nhạc, hiệu ứng và đọc giải thích có công tắc, âm lượng tùy chỉnh và lưu trên máy.
- Trên điện thoại, danh sách giọng có thể khác với máy tính. Chỉ những giọng được thiết bị liệt kê mới sử dụng được. Không bảo đảm phương ngữ miền Trung nếu không có giọng thực tế tương ứng.

## Giọng tiếng Việt có sẵn – chạy ngay trên mọi thiết bị

GitHub Actions tự sinh 8 câu khen bằng mô hình **Piper vi_VN-vais1000-medium**, nguồn `rhasspy/piper-voices`. Các file MP3 được đóng gói trong `/hocvui/audio/vi-piper/` ở mỗi lần phát hành. Website tự ưu tiên bộ giọng này; không cần Web Speech API, FPT.AI, Firebase Functions, hay API key.

- Giọng VAIS1000 là nữ tiếng Việt, chưa được xác nhận có phương ngữ miền Trung. Người sử dụng có thể nghe thử trong cài đặt.
- Model: https://huggingface.co/rhasspy/piper-voices/tree/v1.0.0/vi/vi_VN/vais1000/medium
- Corpus: VAIS-1000 Vietnamese Speech Synthesis Corpus, giấy phép **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/.
- Trong website có đường dẫn ghi công và thông tin giấy phép ở `audio/vi-piper/ATTRIBUTION.txt`.
- Model ONNX chỉ tải về GitHub Actions để tổng hợp, không chuyển 63 MB mô hình tới máy bé.
- Giọng Mỹ An/FPT.AI vẫn là tùy chọn bổ sung nếu sau này được cấp phép và kích hoạt.

## Tùy chọn nâng cao: bộ MP3 giọng Mỹ An miền Trung

Tài khoản FPT.AI và khóa API **không cần thiết để dùng chế độ giọng có sẵn**. Chỉ cần khi muốn mọi thiết bị phát cùng một giọng miền Trung đã được cấp phép. Quy trình dưới đây là tùy chọn.

## Tạo bộ MP3 Mỹ An của FPT.AI (một lần, thủ công)

Yêu cầu: tài khoản FPT.AI có API Text to Speech hoạt động, quyền phân phối tệp âm thanh phù hợp mục đích sử dụng, và ngân sách nếu dịch vụ tính phí.

1. Trên GitHub, vào **Settings → Secrets and variables → Actions → New repository secret**.
2. Đặt tên secret: `FPT_TTS_API_KEY`. Dán API key vào **GitHub Secret**, không dán vào mã nguồn, issue hoặc chat.
3. Vào **Actions → Prepare licensed central-Vietnamese praise voice → Run workflow**.
4. Workflow gọi API FPT `voice: myan`, `speed: -1`, tạo 8 MP3 cố định, kiểm tra file, commit tài nguyên vào `public/audio/vi-central/` và bật `CENTRAL_VOICE_READY`.
5. Sau khi CI triển khai thành công, chọn **Cô Mỹ An – miền Trung (MP3)** trong mục **Giọng cô khen** của bảng **Âm thanh dịu nhẹ**.

Tất cả clip MP3 nằm ở đường dẫn tương đối với GitHub Pages, ví dụ `/hocvui/audio/vi-central/praise-01.mp3`. API key không đi vào JavaScript web.

## Lưu ý

- GitHub có thể chặn thao tác `git push` của workflow nếu **Actions → General → Workflow permissions** không cho ghi. Chỉ bật quyền ghi cho GitHub Actions nếu anh chủ động muốn workflow tự commit các MP3.
- Tên `puzzle_master` là mã huy hiệu cũ để tương thích dữ liệu đã lưu; tên hiển thị được đổi thành **Thợ Săn Sao**.
- Nếu không có API key, website sử dụng giọng Việt được thiết bị cung cấp (nếu có). Khi thiết bị không có giọng Việt, lời khen hiện bằng chữ kèm hiệu ứng nhẹ. Không cần đăng ký dịch vụ bên ngoài.
