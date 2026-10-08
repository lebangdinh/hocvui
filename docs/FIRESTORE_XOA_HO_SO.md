# Học Vui – Xóa hồ sơ theo Thùng rác 30 ngày

**Tài liệu này thay thế hướng dẫn xóa ngay lập tức trước đó.** Hồ sơ khi bấm Xóa ở trang chọn bé hoặc Cài đặt **không bị xóa vĩnh viễn**, mà chuyển vào Thùng rác và có thể khôi phục trong 30 ngày (gồm toàn bộ điểm, huy hiệu, lịch sử học tập).

Xem hướng dẫn chính thức: [THUNG_RAC_30_NGAY.md](THUNG_RAC_30_NGAY.md).

## Cần xuất bản Cloud Firestore Rules một lần

1. Mở https://console.firebase.google.com/project/hoc-vui-tieu-hoc-2026/firestore/databases/-default-/rules.
2. Chọn đúng dự án `hoc-vui-tieu-hoc-2026`, database `(default)`, dịch vụ **Cloud Firestore**.
3. Dán toàn bộ https://raw.githubusercontent.com/lebangdinh/hocvui/main/firestore.rules thay cho Rules cũ, chọn **Publier / Publish**.
4. Đợi khoảng một phút, tải lại Học Vui bằng **Ctrl + Shift + R**.
5. Thử quy trình Chuyển vào Thùng rác → Khôi phục trước bằng **hồ sơ thử**, không thử với dữ liệu thật chưa sao lưu.

Nếu Rules mới chưa được xuất bản, Firebase có thể từ chối cả chuyển vào Thùng rác lẫn khôi phục. Không được thay bằng `allow read, write: if true`.

## Giới hạn miễn phí

Việc dọn vật lý hồ sơ quá 30 ngày hiện diễn ra khi có phụ huynh mở ứng dụng; nếu không ai mở, dữ liệu thực tế có thể được giữ lâu hơn. Hết hạn vẫn không thể khôi phục. Muốn tự xóa đúng lịch ngay cả lúc website đóng cần tác vụ máy chủ riêng.
