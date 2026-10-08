# Học Vui V5 — Đã gắn Firebase Web App `hoc-vui-tieu-hoc-2026`

## Trạng thái
- Đã đưa cấu hình **Firebase Web SDK do chủ dự án cung cấp** vào `firebase-applet-config.json`.
- Đã đặt Firebase CLI project mặc định trong `.firebaserc`.
- Chưa triển khai Firebase Hosting / Firestore rules / Functions; chưa thử Google Login thực tế.
- Firestore hiện đang có rule mặc định `allow read, write: if false;` theo ảnh chụp: giữ nguyên cho đến khi triển khai rule an toàn trong bộ mã.
- Không có khóa **Gemini** trong tệp này. **Không đưa khóa Gemini Developer API vào cấu hình Web**.

## Bước 1 — Kiểm tra Firebase Console
- Firebase → Authentication → Sign-in method: **Google Enabled** (đã làm).
- Authentication → Settings → Authorized domains: khi có Hosting, đảm bảo `hoc-vui-tieu-hoc-2026.web.app` (và miền tùy chỉnh nếu dùng) đã được thêm; không thêm miền bất kỳ.
- Firestore: `(default)`, Production rules. **Chưa tạo collection bằng tay**.
- Firebase Web app: đúng `Hoc Vui Web` / `hoc-vui-tieu-hoc-2026`.

## Bước 2 — Cài từ ZIP ở máy chủ sở hữu dự án
Dùng Node.js 22 / Windows PowerShell (đừng chạy trong thư mục nén):

```powershell
npm install -g firebase-tools
firebase login
npm ci
cd functions
npm install
cd ..
npm run test:offline
npm run lint
npm run build
```

## Bước 3 — Triển khai thử Hosting và Firestore
Chỉ khi các bước trên thành công và đã xem kỹ `firestore.rules`. Với Spark, thử web cơ bản chưa cần Functions, nhưng **những tính năng gọi Functions (Gemini, duyệt/xóa)** sẽ chưa hoạt động:

```powershell
$env:HOC_VUI_STAGING_PROJECT_ID="hoc-vui-tieu-hoc-2026"
npm run check:deploy
firebase deploy --only firestore,hosting --project hoc-vui-tieu-hoc-2026
```

Sau đó mở `https://hoc-vui-tieu-hoc-2026.web.app`. Kiểm tra Google Login, tạo hồ sơ và xem dữ liệu Firestore.

## Bước 4 — Functions + Gemini + quản trị
Cần nâng lên **Blaze** và kiểm soát chi phí trước khi triển khai Firebase Functions. Chỉ dùng Gemini secret được nhập *trực tiếp* trên máy riêng:

```powershell
firebase functions:secrets:set GEMINI_API_KEY --project hoc-vui-tieu-hoc-2026
$env:HOC_VUI_STAGING_PROJECT_ID="hoc-vui-tieu-hoc-2026"
npm run deploy:staging
```

Lưu ý: hãy kiểm thử Emulator, giới hạn sử dụng, quyền của tài khoản `reviewer` / `admin`, và Cloud Billing trước khi bật công khai. Không gửi `GEMINI_API_KEY` hay JSON service account trong cuộc trò chuyện.

## Độ an toàn
- `firebase-applet-config.json` chỉ chứa **Web Firebase config**; kiểm soát truy cập bằng **Security Rules**, **Authentication** và sau đó **App Check**.
- Không tự động coi học liệu chưa được người duyệt xác nhận là chuẩn SGK.
- Không coi lệnh deploy/kiểm thử ngoại tuyến là xác nhận đã thử thực tế.
