# Học Vui V11 – gói mã nguồn sạch

- 102 chủ đề lớp 1–5, Luyện tập chung và Tự thử sức, nút Quay lại/Về trang chính.
- Ngân hàng **chỉ gồm 2.823 câu đã AI sơ tuyển** của 83 chủ đề ngoài Toán; Toán dùng sinh câu theo tham số ổn định. Các câu bị tạm giữ không được đóng gói.
- Các câu chưa được giáo viên chứng nhận; đây là học liệu thử nghiệm, không có dấu xác nhận giáo viên.
- Không còn báo cáo/dữ liệu đời V6–V9 trong gói mới; không tự xóa file cũ trên GitHub nếu chỉ tải lên ghi đè.

## Kiểm tra và phát hành

```bash
npm ci
npm run test:offline
npm run test:v11
npm run lint
npm run build
```

**Rất quan trọng:** đọc `HUONG_DAN_DON_DEP_REPO_V11.md` để xóa file cũ đã tồn tại trên GitHub trước khi tải gói này lên. GitHub Upload chỉ ghi đè, không tự xóa.
