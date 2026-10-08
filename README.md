# Học Vui Tiểu Học — triển khai thử nghiệm V5

Ứng dụng học tập lớp 1–5. **Chưa triển khai V5 công khai cho tới khi build và các kiểm tra bên dưới đạt.**

## Bảo toàn bản cũ

- Nhánh website lớp 1 nguyên gốc: [backup-hocvui-lop1-20261008](../../tree/backup-hocvui-lop1-20261008).
- Website hiện tại vẫn phục vụ từ `main/index.html` cho đến khi đổi GitHub Pages sang nguồn **GitHub Actions** và một bản build V5 thành công.
- Không xóa nhánh sao lưu.

## Đưa mã nguồn V5 lên GitHub và phát hành

Workflow: [.github/workflows/deploy-hocvui-v5.yml](.github/workflows/deploy-hocvui-v5.yml).

1. Vào [Releases](../../releases) → **Draft a new release**.
2. Nhập tag **`v5-source-20261008`** và tiêu đề “Học Vui V5 — source archive”.
3. Trong ô **Attach binaries by dropping them here or selecting them**, tải lên tệp nguyên vẹn **`Hoc_Vui_V5_KetNoi_Firebase_hoc-vui-tieu-hoc-2026.zip`** đã được cung cấp (không đổi tên hoặc giải nén). Publish release.
4. Trong **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
5. Vào **Actions → Deploy Học Vui V5 to GitHub Pages → Run workflow**, chọn nhánh **main**.
6. Theo dõi job: kiểm tra SHA-256 của ZIP → đối chiếu Project ID Firebase → `npm ci` → test offline → kiểm tra TypeScript → build Vite với `/hocvui/` → deploy.
7. Khi job thành công, kiểm tra **https://lebangdinh.github.io/hocvui/** trên trình duyệt ẩn danh.

Tệp ZIP phải có mã SHA-256: `e2c1488490ebf7cf356f9f56679d25dbe55b34ac21caecd336cb2ce68b2cb3ad`. Nếu sai hash, workflow dừng **trước khi publish**. Chỉ tải lên ZIP đã được kiểm tra; không sửa nội dung và không bỏ bảo vệ hash.

## Firebase (các bước riêng)

- Project ID: `hoc-vui-tieu-hoc-2026` (Web config đã điền trong ZIP).
- Firebase Authentication: Google bật; `lebangdinh.github.io` là authorized domain.
- Firestore: hiện **deny-all** (mặc định). **Không chuyển test mode.** Cần kiểm thử rồi triển khai `firestore.rules` và `firestore.indexes.json` từ mã nguồn V5 qua Firebase CLI.
- Gemini AI cần Firebase Cloud Functions và gói Blaze với giới hạn ngân sách/giám sát chi phí. Chỉ lưu `GEMINI_API_KEY` trong Secret Manager, tuyệt đối không commit lên GitHub.
- Phân quyền reviewer/admin dùng Firebase custom claims do Firebase Admin SDK cấp. Không tự chỉnh role trong Firestore.

**Quan trọng:** GitHub Pages chỉ chạy giao diện. Nếu chưa triển khai rules/Functions, đăng nhập Google có thể hiện nhưng hồ sơ học tập và AI chưa vận hành đầy đủ. Dữ liệu trẻ em phải được kiểm thử bảo mật trước khi dùng thực tế.

**Học liệu:** 102/102 chủ đề có bài luyện bổ trợ, **0 chủ đề được giáo viên phê duyệt**; không công bố là đã thẩm định SGK.

## Khôi phục bản lớp 1

Có thể thiết lập lại Pages nguồn **Deploy from a branch → main /(root)** để dùng `main/index.html` cũ, hoặc khôi phục từ nhánh `backup-hocvui-lop1-20261008`.
