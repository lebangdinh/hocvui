# Thùng rác hồ sơ học sinh – khôi phục trong 30 ngày

## Nghiệp vụ và bảo mật

- Bấm **Xóa** tại màn hình chọn bé hoặc trong Cài đặt chỉ **chuyển vào Thùng rác**, không xóa vật lý. Hồ sơ được đánh dấu `deletedAt` (giờ máy chủ Firestore) và `deleteAfter` (thời hạn xấp xỉ 30 ngày).
- Hồ sơ đã lưu trong Thùng rác không hiện ở danh sách học, không thể tích lũy thêm điểm, huy hiệu hoặc lượt làm bài.
- Phụ huynh cùng tài khoản Google có thể bấm **Thùng rác → Khôi phục** trong 30 ngày. Mọi trường cũ của hồ sơ và mọi bản ghi hoạt động vẫn giữ nguyên; khôi phục chỉ gỡ hai dấu thời gian.
- Hết 30 ngày, ứng dụng vô hiệu hóa nút Khôi phục; Firestore Rules cũng từ chối thao tác khôi phục theo thời gian máy chủ.
- Phụ huynh có thể **Xóa vĩnh viễn** trước hạn bằng cách nhập chính xác tên bé. Chỉ hồ sơ **đã nằm trong Thùng rác** mới được xóa vật lý. Lịch sử được xóa cùng hồ sơ trong một atomic batch có xác nhận máy chủ.
- Nếu bé có nhiều hơn **400 bản ghi lịch sử**, thao tác xóa vật lý dừng an toàn và cần quy trình xử lý trên máy chủ; không xóa một phần.

## Giới hạn triển khai trên Firebase Spark và GitHub Pages

**Không có một tác vụ nền chạy 24/7** khi website đóng. Trên phiên bản hiện tại, Học Vui sẽ thử dọn hồ sơ quá hạn khi phụ huynh đăng nhập/mở ứng dụng (có kết nối). Do đó dữ liệu vật lý **có thể được lưu lâu hơn 30 ngày nếu không ai đăng nhập hoặc có lỗi kết nối/quyền**. Tuy nhiên, hệ thống vẫn từ chối khôi phục sau hạn. Muốn đảm bảo xóa độc lập, kể cả khi không có người mở website, cần thiết lập backend định kỳ có quyền quản trị, log và xử lý trường hợp nhiều bản ghi; chức năng đó chưa được triển khai.

**Không cấu hình Firestore TTL chỉ trên document profile**: vì TTL riêng có thể xóa profile nhưng bỏ lại các bản ghi `activities` mồ côi. Quy trình đúng cần xử lý cả dữ liệu liên quan.

## BẮT BUỘC: Xuất bản Cloud Firestore Rules mới

1. Mở [Firebase Console – Cloud Firestore → Rules](https://console.firebase.google.com/project/hoc-vui-tieu-hoc-2026/firestore/databases/-default-/rules).
2. Xác minh đúng dự án `hoc-vui-tieu-hoc-2026`, database `(default)`, **Cloud Firestore**, không phải Realtime Database.
3. Sao chép **toàn bộ** [firestore.rules mới từ GitHub](https://raw.githubusercontent.com/lebangdinh/hocvui/main/firestore.rules), dán thay bộ cũ rồi chọn **Publier / Publish**.
4. Đợi khoảng 1 phút, tải lại [Học Vui](https://lebangdinh.github.io/hocvui/) với **Ctrl + Shift + R**.
5. Nghiệm thu bằng **hồ sơ thử nghiệm**: chuyển Thùng rác → kiểm tra không còn ở danh sách học → Khôi phục → kiểm tra điểm và lịch sử giữ nguyên. Không dùng hồ sơ bé đang học để thử nếu chưa có bản sao lưu.

**Lưu ý:** GitHub Pages được cập nhật không đồng nghĩa Firebase Rules đã triển khai. Nếu không Publish, hệ thống sẽ báo quyền từ chối, không khẳng định đã đưa bé vào Thùng rác.

## Bảo vệ các học sinh còn lại

Rules chỉ cho chủ tài khoản `uid` cập nhật `deletedAt/deleteAfter`, bắt buộc hai trường xuất hiện và được gỡ cùng nhau; không cho cập nhật điểm khi ở Thùng rác; không cho tạo hoạt động mới của hồ sơ bị lưu trữ; chỉ cho xóa vĩnh viễn hồ sơ đã lưu trữ. Không bao giờ đặt `allow read, write: if true`.
