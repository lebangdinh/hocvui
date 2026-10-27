# Học Vui V11 – bổ sung nút Quay lại / Về trang chính

## Đã sửa

- Trên màn hình đang làm bài **Luyện tập** và **Tự thử sức**, luôn có hai nút dễ thấy: **Quay lại chọn bài** và **Về trang chính**.
- Cả hai nút cũng xuất hiện trong lúc đang tải câu hỏi, khi không có bài phù hợp và trên màn hình kết quả.
- **Quay lại chọn bài**: quay về màn hình chọn chủ đề/chế độ của môn hiện tại.
- **Về trang chính**: đóng bài, thoát môn hiện tại và chuyển về tab **Học tập** (danh sách môn).
- Khi đang làm dở, hiển thị xác nhận trước khi thoát; bài dở **chưa được tính điểm** và không khôi phục câu đang làm.
- Khi đã hoàn thành nhưng Firebase chưa lưu kết quả thành công, cảnh báo trước khi thoát.
- Trong lúc đang lưu kết quả, hai nút bị khóa để tránh bỏ dở giao dịch.
- Dừng phát âm bài đang chạy khi rời màn hình.
- Hiển thị nhãn **Học Vui V11** để nhận biết trang đã cập nhật.

## Kiểm thử tự động

```bash
npm ci
npm run test:v11
npm run lint
VITE_BASE_PATH=/hocvui/ npm run build
npm run verify:v11-dist
```

`test:v11` bao gồm 22 kiểm tra điều hướng/lưu điểm, kiểm tra 4 trạng thái màn hình, và 1.314 kiểm tra lấy câu V10. Đây là kiểm thử đơn vị/cấu trúc, không phải kiểm thử tương tác thực tế bằng trình duyệt.

## Kiểm tra thủ công sau khi triển khai

1. Vào **Lớp 1 → Tiếng Việt → Bắt đầu luyện tập**. Phía trên thẻ câu hỏi phải thấy **Quay lại chọn bài** và **Về trang chính**.
2. Chọn một đáp án, thử **Quay lại chọn bài** rồi **Hủy** hộp thoại: phải ở lại bài; nhấn lại rồi **Đồng ý**: quay về chọn bài.
3. Vào **Tự thử sức** rồi nhấn **Về trang chính**. Chọn **Đồng ý**: phải trở về danh sách các môn.
4. Kiểm tra nút trên cả trạng thái **Đang chuẩn bị**, **hết câu mới** và sau khi **Hoàn thành**. Nếu kết quả chưa lưu Firebase, xác nhận phải xuất hiện; nếu đang lưu thì tạm không thể rời.
5. Vào lại bài luyện theo chủ đề và Luyện tập chung để chắc chắn lịch sử chống trùng vẫn tồn tại. Đừng xóa bộ nhớ trang / localStorage khi thử.

## Triển khai GitHub

**Không xóa toàn bộ repo đang chạy.** Nên tạo nhánh thử, giải nén ZIP, ghi đè tệp trùng tên và giữ cấu trúc thư mục. Không xóa tệp `.github/`, `firebase.json`, cấu hình Firestore hoặc Cloudflare. Bản ZIP không có mật khẩu, token hoặc nội dung thư mục node_modules.

GitHub Pages phải dùng **Settings → Pages → Source: GitHub Actions** và chạy workflow `.github/workflows/deploy-hocvui-v5.yml`, build React vào `dist/`; nếu còn dùng `Deploy from a branch` có thể nhìn thấy giao diện HTML cũ không có các nút điều hướng mới.

Bản ZIP chỉ cập nhật mã nguồn: **không tự đưa lên GitHub hoặc thay trang web đang chạy**.
