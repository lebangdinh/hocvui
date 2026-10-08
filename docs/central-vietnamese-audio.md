# Giọng khen tiếng Việt nữ miền Trung – Học Vui

## Hoạt động hiện tại

- Các câu khen ngắn được hiển thị bằng chữ trên màn hình.
- Không tự phát giọng máy của trình duyệt sau mỗi câu trả lời.
- Nhạc nền, hiệu ứng, lời khen và đọc giải thích có công tắc riêng, lưu trên trình duyệt.
- Nhạc nền tắt mặc định. Hiệu ứng mặc định chỉ ở mức 8%.
- Nút nghe giải thích chỉ hoạt động sau khi phụ huynh chủ động bật, và yêu cầu thiết bị có giọng tiếng Việt. Giọng giải thích **không cam kết là miền Trung**.
- Giọng khen nữ miền Trung **chỉ hoạt động khi cả 8 MP3 thật đã được tạo**; không giả mạo giọng bằng TTS tiếng nước ngoài.

## Tạo bộ MP3 Mỹ An của FPT.AI (một lần, thủ công)

Yêu cầu: tài khoản FPT.AI có API Text to Speech hoạt động, quyền phân phối tệp âm thanh phù hợp mục đích sử dụng, và ngân sách nếu dịch vụ tính phí.

1. Trên GitHub, vào **Settings → Secrets and variables → Actions → New repository secret**.
2. Đặt tên secret: `FPT_TTS_API_KEY`. Dán API key vào **GitHub Secret**, không dán vào mã nguồn, issue hoặc chat.
3. Vào **Actions → Prepare licensed central-Vietnamese praise voice → Run workflow**.
4. Workflow gọi API FPT `voice: myan`, `speed: -1`, tạo 8 MP3 cố định, kiểm tra file, commit tài nguyên vào `public/audio/vi-central/` và bật `CENTRAL_VOICE_READY`.
5. Sau khi CI triển khai thành công, thử chọn **Lời khen giọng nữ miền Trung** trong bảng **Âm thanh dịu nhẹ**.

Tất cả clip MP3 nằm ở đường dẫn tương đối với GitHub Pages, ví dụ `/hocvui/audio/vi-central/praise-01.mp3`. API key không đi vào JavaScript web.

## Lưu ý

- GitHub có thể chặn thao tác `git push` của workflow nếu **Actions → General → Workflow permissions** không cho ghi. Chỉ bật quyền ghi cho GitHub Actions nếu anh chủ động muốn workflow tự commit các MP3.
- Tên `puzzle_master` là mã huy hiệu cũ để tương thích dữ liệu đã lưu; tên hiển thị được đổi thành **Thợ Săn Sao**.
- Nếu chưa có API key, website vẫn dùng lời khen bằng chữ và hiệu ứng nhỏ, hoàn toàn không phát giọng tổng hợp cũ.
