# V5 — Quy trình biên tập và duyệt 102 chủ đề

**Trạng thái thực tế: 0/102 chủ đề được giáo viên phê duyệt.** V5 chỉ cung cấp quy trình và màn hình để một người có chuyên môn tổ chức thẩm định. Bộ câu hỏi không sao chép nguyên văn SGK.

## Nguồn cần đối chiếu

- **Bộ chương trình GDPT 2018** theo TT 32/2018/TT-BGDĐT; các cập nhật trong TT 17/2025/TT-BGDĐT phải được xem với các môn bị điều chỉnh.
- **SGK Kết nối tri thức với cuộc sống** chính thức dành cho lớp/môn đang duyệt theo QĐ 3588/QĐ-BGDĐT, năm học 2026–2027.
- `content/alignment-review-queue.json` chứa tên chủ đề ứng dụng, không đồng nghĩa tên bài SGK; các trường chưa biết, ví dụ `sgkPages`, phải để trống chứ không suy đoán.
- `content/sgk-math-alignment.json` hiện có đối chiếu sơ bộ cấp chủ đề cho Toán, không phải biên bản kiểm định nội dung từng trang.

## Trình tự thao tác của giáo viên

1. Đăng nhập tài khoản Google đã được chủ dự án cấp `reviewer` (custom claims).
2. Mở **Duyệt bài**, chọn từng chủ đề. Đọc phạm vi kiến thức và **toàn bộ ngân hàng câu hỏi tĩnh** trên màn hình (gồm đáp án/giải thích); sửa câu sai ở mã nguồn, chạy build và fingerprint mới trước khi duyệt.
3. Với bài **Toán sinh ngẫu nhiên**, giao diện chỉ hiển thị 20 mẫu. Phải đọc và kiểm chứng thuật toán sinh số/đáp án, kiểm thử các biên và độ khó; không thể nhận 20 câu mẫu là đã kiểm tra hết câu có thể được sinh.
4. Đối chiếu bản in hoặc bản SGK được phép sử dụng: môn, lớp, mục tiêu, bài/chủ đề, yêu cầu cần đạt và phạm vi; không thêm kiến thức vượt lớp. Kiểm tra câu trắc nghiệm chỉ có một đáp án đúng phù hợp, các phương án gây nhiễu hợp lí và ngôn ngữ an toàn với trẻ.
5. Đối với viết, nghe, nói, đọc to, lắp ghép công nghệ, thể chất, mĩ thuật và hoạt động trải nghiệm: **trắc nghiệm bổ trợ không đánh giá đầy đủ năng lực**, phải có hoạt động thực hành riêng nếu muốn gọi là hoàn thành yêu cầu cần đạt.
6. Tạo biên bản kèm đường dẫn minh chứng HTTPS, ghi tên người kiểm tra, bài SGK tham chiếu và yêu cầu cần đạt; đánh dấu ba mục xác nhận rồi mới chọn **Phê duyệt**. Firebase Functions kiểm tra claim, hồ sơ, kiểm tra checklist, lưu fingerprint và audit. Đây là xác nhận của người duyệt, máy chủ **không thể tự kiểm chứng tư cách giáo viên hoặc tài liệu HTTPS**.
7. Nếu phát hiện sai, chọn **Thu hồi** và ghi lý do. Nếu sửa mã ngân hàng, fingerprint đổi khiến hồ sơ duyệt cũ không được ứng dụng công nhận nữa. Cần duyệt lại.

## Chế độ sử dụng học liệu

- **Luyện tập:** dùng ngân hàng câu hỏi đã soạn nhưng hiển thị trạng thái chưa thẩm định rõ ràng.
- **Tự thử sức:** chỉ mở khi có `contentApprovals/<topicId>` được Firebase backend ghi với `status=approved` và fingerprint đúng bản đang chạy. Mặc định tất cả đều khóa chế độ này.
- **Gemini:** mọi câu do AI sinh được gắn `ai_unverified`, không đưa vào ngân hàng duyệt mặc định và không được tự coi là câu SGK chính thức.

## Phân công tổ chức

| Vai trò | Việc cần làm |
|---|---|
| Chủ dự án / admin | Vận hành Firebase, cấp quyền bằng Admin SDK, giám sát audit |
| Giáo viên / reviewer | Đọc từng nội dung, đối chiếu tài liệu chính thức, ghi biên bản và quyết định duyệt/thu hồi |
| Người phát triển | Chỉnh câu, sửa thuật toán, kiểm thử, cập nhật fingerprints, không tự động hợp thức hóa học liệu |
| Phụ huynh | Chọn lớp/hồ sơ và theo dõi tiến bộ, không truy cập cổng duyệt |

**Không đánh dấu 100% chuẩn SGK chỉ vì 102/102 chủ đề có câu hỏi bổ trợ.** Hoàn thiện thực sự phải có xác minh theo SGK cụ thể, đánh giá năng lực từng môn và hồ sơ thẩm định của người có chuyên môn.
