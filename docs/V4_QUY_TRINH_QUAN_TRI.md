# Học Vui V4 — Quy trình phân quyền và phát hành học liệu

## Cấp quyền

- `parent`: mặc định khi đăng nhập Google, quản lý hồ sơ bé trong tài khoản của mình, xem và chơi bài chưa thẩm định với cảnh báo.
- `reviewer`: được cấp custom claim bằng Admin SDK của Firebase; đánh dấu duyệt/thu hồi ngân hàng câu hỏi soạn sẵn.
- `admin`: có quyền duyệt như reviewer; chịu trách nhiệm kiểm soát người được cấp quyền qua Admin SDK (không có nút tự cấp quyền từ trình duyệt).
- Rules **cấm client ghi `contentApprovals`, `contentReviewAudit`, `privateRateLimits` và tài liệu `users/{uid}`**. User không được tự sửa trường `role` để lên admin. Kiểm tra thêm với Firebase Emulator trước khi phát hành.

## Nội dung phải kiểm tra trước khi phê duyệt

1. Có bản SGK *Kết nối tri thức với cuộc sống* được sử dụng hợp pháp; xác minh **môn, lớp, chủ đề, đơn vị bài và trang**, không chỉ dựa trên mục lục thứ cấp.
2. Đối chiếu với chương trình môn học ban hành theo TT 32/2018 và văn bản sửa đổi hiện hành; kiểm tra **yêu cầu cần đạt** tương ứng từng kỹ năng/câu hỏi.
3. Giáo viên đọc từng câu, các phương án, lời giải, lựa chọn duy nhất đáp án đúng; đảm bảo ngôn ngữ và mức độ lớp học.
4. Với môn thực hành, trắc nghiệm nhận biết chỉ có chức năng hỗ trợ, **không** đánh giá năng lực vận động/biểu diễn/kỹ năng sống.
5. Đăng nhập tài khoản đã được cấp `reviewer/admin`, mở **Duyệt bài**, chọn chủ đề, ghi tên thực, mã biên bản, tên bài SGK, yêu cầu cần đạt và URL tài liệu nguồn. Bấm **Phê duyệt**; xem log trong `contentReviewAudit`.
6. Nếu sai/học liệu thay đổi, bấm **Thu hồi** kèm lý do. Mỗi lần thay đổi câu hỏi hoặc khung chương trình, bắt buộc build lại fingerprint và triển khai lại Functions để trạng thái duyệt được đối chiếu đồng nhất.

## Rủi ro cần xử lý tiếp trước thương mại hóa

- **Chống gian lận:** Hiện câu hỏi và chấm điểm ở client; người hiểu lập trình có thể giả kết quả XP. Muốn điểm thưởng chính thức cần phiên làm bài được ký và chấm ở server.
- **Đánh giá giáo viên:** Đặt chính sách ai được làm reviewer; hiện xác thực Google/cấp quyền chỉ xác nhận tài khoản được ủy quyền, **không tự xác minh chứng chỉ giáo viên**.
- **Riêng tư trẻ em:** Có sự đồng ý của phụ huynh, công bố chính sách sử dụng AI và dữ liệu, hạn chế dữ liệu cá nhân, quy trình xóa/tải dữ liệu, hạn chế chi phí và lạm dụng.
- **Hạ tầng:** Kích hoạt App Check, cảnh báo quota/chi phí, kiểm thử Firestore Rules qua Emulator, theo dõi lỗi Functions, quyết định cách hosting. Không để key ở web.
- **Nội dung:** Còn 20 chủ đề chỉ có AI và chưa có bài soạn sẵn. Chưa có giáo viên thẩm định bất kỳ câu nào. Cần tiếp tục đối chiếu cụ thể từng bài/trang SGK.
