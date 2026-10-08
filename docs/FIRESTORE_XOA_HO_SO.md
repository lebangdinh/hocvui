# Sửa chức năng xóa hồ sơ học sinh – Học Vui

## Tại sao bấm OK vẫn không xóa được?

Website trước đây gọi Firebase Cloud Function `deleteChildProfile`, nhưng máy chủ Cloud Functions chưa được triển khai. Bộ `firestore.rules` cũ lại `allow delete: if false` đối với hồ sơ, nên người dùng không thể xóa trực tiếp. Giao diện chọn học sinh cũng không bắt lỗi từ lệnh xóa.

## Bản sửa

- Chỉ tài khoản Google của **phụ huynh sở hữu hồ sơ** mới có quyền xóa hồ sơ đó. Không có quyền xóa hồ sơ của tài khoản khác.
- Ứng dụng đọc toàn bộ `activities` của tài khoản hiện tại từ máy chủ, lọc `profileId` đúng với bé, rồi xóa lịch sử của bé cùng hồ sơ bằng **một Firestore atomic batch**.
- Tối đa 400 bản ghi lịch sử trong một batch. Nếu vượt ngưỡng, ứng dụng dừng trước khi xóa bất cứ dữ liệu nào và yêu cầu hỗ trợ bằng máy chủ.
- Sau khi máy chủ chấp nhận batch, ứng dụng xác nhận hồ sơ đã biến mất khỏi Firestore; nếu chưa chắc chắn, giao diện hiển thị trạng thái cần kiểm tra lại.
- Từ màn hình chọn học sinh hoặc Cài đặt: có trạng thái Đang xóa, chống bấm lặp và thông báo lỗi rõ ràng. Không tự ẩn hồ sơ nếu Firebase chưa cho phép xóa.

## BẮT BUỘC: Xuất bản Firestore Rules mới

GitHub Pages không thể tự triển khai Firestore Rules. Thao tác này cần quyền quản lý Firebase của chủ dự án.

1. Truy cập [Firebase Console – Firestore Rules](https://console.firebase.google.com/project/hoc-vui-tieu-hoc-2026/firestore/databases/-default-/rules).
2. Kiểm tra dự án đang chọn là **`hoc-vui-tieu-hoc-2026`**, dịch vụ **Cloud Firestore**, database **`(default)`**, tab **Rules / Règles**. Không dán ở Realtime Database.
3. Mở [firestore.rules – Học Vui](https://raw.githubusercontent.com/lebangdinh/hocvui/main/firestore.rules), sao chép **toàn bộ nội dung**, thay nội dung Rules hiện tại và bấm **Publish / Publier**.
4. Đợi khoảng 1 phút, mở lại [Học Vui](https://lebangdinh.github.io/hocvui/), nhấn **Ctrl + Shift + R**. Chỉ bấm xóa nếu thật sự muốn xóa vĩnh viễn bé đó và lịch sử học tập.
5. Sau khi xác nhận xóa, hồ sơ biến mất khỏi danh sách. Kiểm tra Firestore Data nếu cần: `users/{uid}/profiles/{profileId}` và các `activities` có `profileId` tương ứng.

**Bảo mật:** Không thay rules bằng `allow read, write: if true`, không cho xóa toàn bộ bảng, không yêu cầu API key Gemini, không yêu cầu Blaze. Mã rules giữ quyền truy cập giới hạn đúng chủ hồ sơ, không mở dữ liệu riêng tư của bé khác.

Nếu Rules mới chưa Publish hoặc chưa được áp dụng, giao diện sẽ báo lỗi rõ và batch bị từ chối nguyên vẹn. Không thể coi việc cập nhật GitHub là đã triển khai xong Firebase Rules.

## Lưu ý

Chức năng **Xóa toàn bộ tài khoản Google** vẫn phụ thuộc backend `deleteMyAccount` chưa triển khai và sẽ được báo chưa hoạt động, không nói xóa thành công. Để xoá khối lượng dữ liệu lớn vượt 400 hoạt động cần backend an toàn.
