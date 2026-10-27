> Tài liệu của bản sửa đầu. Bản rà soát tiếp theo nằm trong `RA_SOAT_TOAN_DIEN_2026-10-27.md` và có kết quả/giới hạn cập nhật hơn.

# Bản sửa lịch sử học và hiệu năng – 27/10/2026

## Các vấn đề tìm thấy trong mã nguồn
- Lưu bài bị phụ thuộc vào việc đọc toàn bộ lịch sử tài khoản. Dữ liệu càng nhiều càng tốn tải; lỗi đọc khiến kết quả mới không được ghi.
- Chưa có bản chờ lưu bền vững: đóng/tải lại trang sau lỗi mạng có thể mất kết quả vừa hoàn thành.
- Hết giờ đánh dấu đáp án bằng chuỗi rỗng nhưng giao diện kiểm tra truthy: vẫn cho chọn, không hiện đúng phần tiếp tục.
- Cập nhật duyệt nội dung có thể sinh lại đề đang học.
- Trò chơi và thư viện biểu đồ được tải ngay khi mở ứng dụng.
- Workflow GitHub Pages không triển khai Firestore Rules. Chưa xác minh rules đang chạy trên server.

## Thay đổi
- Ghi kết quả hoàn thành vào hàng đợi localStorage trước khi gọi mạng; thử lại khi mở app, mạng trở lại và mỗi 30 giây. Phân tách theo tài khoản, không tự gửi dữ liệu của tài khoản khác.
- Kiểm tra trùng theo ID bài cụ thể; giữ giao dịch atomic và rules create-only. Nếu mất phản hồi sau khi commit, kiểm tra lại trước khi báo lỗi hoặc cộng sao lần nữa.
- Chỉ đọc tối đa 9 bài của bé và 4 bài cùng môn để xét ngưỡng huy hiệu; lỗi đọc huy hiệu không ngăn commit kết quả. Trường hợp đọc lỗi có thể cấp huy hiệu muộn ở lượt học sau.
- Báo cáo truy vấn theo cả phụ huynh và hồ sơ; vẫn giữ bộ lọc xác minh phía client.
- Sửa kiểm tra đáp án null, giữ nguyên đề sau khi tải xong, bỏ phản hồi AI cũ sau khi rời bài.
- Tải riêng trang học, trò chơi, báo cáo; giảm pháo giấy và tôn trọng reduced motion.
- Hiển thị số kết quả chờ đồng bộ. Lỗi quyền hoặc hồ sơ đã xóa không làm xóa bản chờ.

## Kiểm thử đã thực hiện
- TypeScript, build production, bộ test offline hiện có.
- Test mock mới: mất mạng, tải lại trang (khởi tạo lại module), đổi tài khoản, gửi trùng, gửi đồng thời, server lưu nhưng mất phản hồi, bộ nhớ trình duyệt bị chặn/đầy.
- Test tiến trình, serialization/session và báo cáo lịch Việt Nam.
- Chưa kiểm thử trình duyệt thật với tài khoản Firebase thật hoặc Firebase Emulator; chưa đo FPS/thời gian tải trên điện thoại người dùng. Không coi bản này là đã hết mọi lỗi.

## Chạy thử trước khi đưa lên main
1. Giải nén, tạo nhánh thử; chép nội dung thư mục hocvui-main vào repository (không tạo thư mục lồng trong root).
2. `npm ci` rồi `npm run lint`, `npm run test:offline`, `node scripts/test-pending-lessons.cjs`.
3. Build cho Pages: `VITE_BASE_PATH=/hocvui/ npm run build` (PowerShell: `$env:VITE_BASE_PATH='/hocvui/'; npm run build`).
4. Kiểm tra đúng project `hoc-vui-tieu-hoc-2026`. Nếu app báo permission-denied, so sánh rules/indexes hiện tại với các file trong dự án; người có quyền quản trị triển khai đúng cấu hình Firebase. Bản này không nới rules.
5. Với tài khoản thử: hoàn thành một bài online, xem sao/lịch sử; reload; thử offline lúc kết thúc bài rồi reload, bật mạng và kiểm tra đồng bộ đúng một lần; đổi tài khoản để kiểm tra cách ly; thử hết giờ quiz khi đã có nội dung được duyệt.
6. Giữ bản nguồn cũ/commit cũ để quay lại. ZIP này không tự deploy site đang chạy.

## Giới hạn cần hiểu
- Chỉ giữ bài đã hoàn thành và đã gọi lưu; chưa khôi phục bài đang làm dở.
- Bản chờ chỉ ở trình duyệt/máy đã học. Xóa dữ liệu trang hoặc đóng phiên riêng tư có thể mất bản chờ; không phải sao lưu đám mây.
- Nếu trình duyệt chặn/hết dung lượng localStorage, app báo lỗi và giữ kết quả trên màn hình; cần khắc phục trước khi rời bài.
- Khi quy tắc Firebase từ chối, tài khoản hết quyền, hồ sơ bị xóa/đổi lớp, hàng đợi không thể tự sửa quyền hay hồ sơ. Bản chờ được giữ và hiển thị cảnh báo.
- Bundle chính vẫn lớn (~1,49 MB chưa nén); bước tiếp theo cần đo thực tế và tối ưu thêm module admin/AI nếu còn chậm.
