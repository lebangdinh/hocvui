# Học Vui Tiểu Học — lớp 1–5 (V5)

Website: https://lebangdinh.github.io/hocvui/

React 19 + Vite + Firebase Authentication + Cloud Firestore. Máy chủ Gemini và duyệt học liệu dùng Firebase Functions riêng, không thể chạy trên GitHub Pages và **chưa được triển khai** từ workflow này.

## Trạng thái

- Mã nguồn V5 đã cấu hình dự án `hoc-vui-tieu-hoc-2026`.
- GitHub Actions chạy kiểm thử, type-check và build ở nhánh `v5-deploy-review`; chỉ phát hành khi push lên `main`.
- Google Sign-In cần `lebangdinh.github.io` trong Firebase Authentication > Authorized domains.
- Firestore Rules hiện ở trạng thái khóa theo Firebase Console cho tới khi triển khai `firestore.rules`. Nếu chưa triển khai rules, đăng nhập vẫn có thể chạy, nhưng lưu hồ sơ/báo cáo sẽ bị chặn.
- Gemini, quản trị và xóa dữ liệu bằng callable cần Cloud Functions trên Blaze + Secret Manager, không có khóa Gemini trong repo.
- Bài học bổ trợ chưa được giáo viên ký duyệt thì không được xem là SGK chính thức.

## Lệnh chạy

```bash
npm ci
npm run test:offline
npm run lint
VITE_BASE_PATH=/hocvui/ npm run build
```

## Sao lưu và khôi phục

Phiên bản web lớp 1 cũ ở nhánh `backup-hocvui-lop1-20261008`. Không xóa nhánh này. Để khôi phục, tạo pull request từ nhánh sao lưu vào `main` hoặc trả `main` về commit đã sao lưu.

Không nhập khóa Gemini hoặc service-account JSON vào GitHub. Xem `docs/V5_TRIEN_KHAI_VA_TEST_FIREBASE.md` để cấu hình Functions bằng máy chủ được chủ dự án cấp quyền.

> Trong thời gian chờ đổi **Settings → Pages → Source → GitHub Actions**, file `index.html` ở thư mục gốc tạm giữ giao diện lớp 1 để không làm gián đoạn website. V5 được build từ `vite-entry.html`; CI tự tạo `dist/index.html`. Sau khi đổi Pages sang GitHub Actions, chỉ nội dung `dist` sẽ được phát hành.
