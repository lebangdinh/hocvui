# V5 — Triển khai thử nghiệm Firebase Học Vui (lớp 1–5)

**Trạng thái ngày 08/10/2026: CHƯA TRIỂN KHAI THẬT.** Mục này là quy trình để người sở hữu dự án Firebase thực hiện và ghi kết quả, không phải báo cáo đã test production.

## A. Chốt môi trường và quyền

1. Tạo **một Firebase project riêng của Học Vui**. Không dùng Firebase nguồn Google AI Studio (`gen-lang-client-...`), không dùng dự án Sức Khỏe Siêu Thị / báo cáo DMX. Đặt một Project ID riêng, ví dụ `hoc-vui-tieu-hoc-staging-<chuoi-rieng>`.
2. Tại Firebase Console → **Build → Authentication → Sign-in method → Google → Enable**. Thiết lập email hỗ trợ nếu cần. Tạo Web App (biểu tượng `</>`) và sao chép các trường cấu hình công khai (`apiKey`, `authDomain`, `projectId`, `appId`, `messagingSenderId`) vào `firebase-applet-config.json`. **Firebase Web API key không phải Gemini secret**, nhưng vẫn cần hạn chế API và domain phù hợp.
3. **Build → Firestore Database → Create database** với tên database **`(default)`**. Chọn vùng phù hợp (chọn vùng cơ sở dữ liệu sau đó không dễ thay đổi), bật rules và indexes từ mã nguồn khi deploy. Tuyệt đối không bật chế độ test mở hết quyền rồi giữ như vậy.
4. **Build → Hosting** sẽ được thiết lập khi deploy. Sau đó thêm hostname Hosting vào **Authentication → Settings → Authorized domains** (nhớ kiểm tra thêm host tuỳ chỉnh nếu có). Truy cập Firebase App Check và ngân sách; cần chuẩn bị trước khi mở công khai.
5. Dịch vụ Firebase Functions v2 cần **Blaze billing plan**; xem chi phí và lập cảnh báo ngân sách. `Gemini` có thể phát sinh chi phí riêng theo tài khoản API. *Cảnh báo ngân sách không tự động bảo đảm chặn phát sinh tiền.*

## B. Lắp đặt ở máy quản lý mã nguồn

Node.js **22**. Cài Firebase CLI bản tương thích rồi đăng nhập trong trình duyệt tài khoản **chủ sở hữu dự án**:

```bash
npm install -g firebase-tools
firebase login
npm ci
cd functions
npm install
cd ..
```

Thay `firebase-applet-config.json` bằng Web App config của **đúng Học Vui project**; không đưa `GEMINI_API_KEY` vào tệp này, `.env`, `vite.config.ts`, GitHub hoặc cuộc trò chuyện.

```bash
npm run test:offline
npm run lint
npm run build
```

`npm run test:offline` kiểm tra logic và mock. `npm run lint && npm run build` mới kiểm tra dự án thật qua thư viện đã cài.

## C. Kiểm thử LOCAL trên Firebase Emulator trước

Bật 4 emulator riêng cho dự án thử nghiệm, trên terminal 1:

```bash
firebase emulators:start --only auth,firestore,functions,hosting --project <PROJECT_ID>
```

Terminal 2, bật emulators cho Vite dev:

**macOS/Linux:**
```bash
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```
**Windows PowerShell:**
```powershell
$env:VITE_USE_FIREBASE_EMULATORS="true"
npm run dev
```

Các emulator mặc định trong `firebase.json`: Auth 9099, Firestore 8080, Functions 5001, Hosting 5000, giao diện 4000. Bản emulator không đăng nhập Google thật theo phương thức production; dùng account mô phỏng và test Google popup trên staging Firebase thật sau khi cấu hình. **Không dùng token từ Auth emulator với Firebase thật.**

Để thử Gemini ở emulator, theo hướng dẫn Firebase Secret Manager/Functions Emulator, chỉ tạo tệp secret cục bộ `functions/.secret.local` trên máy riêng nếu cần, không commit. Khuyến nghị chạy test mock trước khi gọi Gemini thật.

## D. Deploy STAGING — chỉ sau khi test emulator đạt

Trong Firebase Console thiết lập **Blaze** theo yêu cầu Cloud Functions và bật các API cần thiết. Cài secret bằng lệnh bảo mật (Firebase CLI hỏi giá trị trong terminal):

```bash
firebase functions:secrets:set GEMINI_API_KEY --project <PROJECT_ID>
```

Dùng đúng ID Học Vui. Ví dụ với **macOS/Linux**:

```bash
export HOC_VUI_STAGING_PROJECT_ID="<PROJECT_ID>"
npm run check:deploy
npm run deploy:staging
```

Với **Windows PowerShell**:

```powershell
$env:HOC_VUI_STAGING_PROJECT_ID="<PROJECT_ID>"
npm run check:deploy
npm run deploy:staging
```

Script sẽ **chặn** nếu biến môi trường không khớp `projectId` trong Web App config, có placeholder hoặc trỏ sang dự án AI Studio/ứng dụng khác; rồi mới kiểm tra và deploy **Functions + Firestore rules/indexes + Hosting**. Các lệnh triển khai cần quyền truy cập Firebase CLI thuộc đúng dự án; không chạy chúng trên máy lạ.

**Sau deploy:** vào `https://<PROJECT_ID>.web.app` hoặc URL Hosting Firebase hiển thị. Bật chính xác domain trong Authorized domains trước khi thử Google Login.

## E. Cấp người duyệt, không để browser tự cấp quyền

Người sở hữu dự án cấp quyền qua Admin SDK trên máy tin cậy, xác nhận thông tin người cần cấp quyền trực tiếp trong Firebase Authentication. Cần đăng nhập bằng ADC/service account phù hợp, nhưng **không gửi JSON service account cho người khác**. Ví dụ:

```bash
export HOC_VUI_STAGING_PROJECT_ID="<PROJECT_ID>"
cd functions
node scripts/set-role.cjs <AUTH_UID> reviewer
# hoặc: node scripts/set-role.cjs <AUTH_UID> admin
```

Role `parent` sẽ xóa custom claim quyền staff; tài khoản vừa thay đổi phải đăng xuất rồi đăng nhập mới để token mới có hiệu lực. Cấp `reviewer` cho người kiểm duyệt và `admin` cho người vận hành theo nguyên tắc ít quyền nhất.

## F. Bảng kiểm nghiệm thu thực tế (phải tự ghi kết quả trên staging)

| Mã | Tình huống cần thử | Tiêu chí đạt | Trạng thái |
|---|---|---|---|
| T01 | Google Login ở URL Hosting thật | Login popup thành công; hiện tài khoản chính xác | Chưa chạy |
| T02 | Phụ huynh A tạo 2 hồ sơ lớp khác nhau | Hai hồ sơ độc lập, tạo và chọn được | Chưa chạy |
| T03 | Phụ huynh A học 5 câu, tải lại trang | Lưu hoạt động và xem lại báo cáo được | Chưa chạy |
| T04 | Phụ huynh B đăng nhập, không thấy hồ sơ A | Không xem hoặc ghi được dữ liệu trẻ của người khác | Chưa chạy |
| T05 | A thử sửa quyền staff trong hồ sơ | Không có tác dụng, Firestore không cho tự cấp | Chưa chạy |
| T06 | Parent gọi `reviewCurriculumTopic` qua API | `permission-denied` | Chưa chạy |
| T07 | Reviewer được cấp claim, đủ checklist/minh chứng | Duyệt tạo bản ghi có fingerprint và audit | Chưa chạy |
| T08 | Thu hồi hoặc sửa nội dung ngân hàng | Trạng thái không còn duyệt / hash cũ không hợp lệ | Chưa chạy |
| T09 | Gemini: gọi khi có hồ sơ hợp lệ | Trả 5 câu; không lộ API key ở Network/browser | Chưa chạy |
| T10 | Gemini: người chưa login, sai hồ sơ, quá hạn mức | Bị từ chối phù hợp | Chưa chạy |
| T11 | Xóa hồ sơ A1 | Xóa hoạt động A1, giữ A2 và dữ liệu phụ huynh B | Chưa chạy |
| T12 | Xóa tài khoản A | Xóa hồ sơ, hoạt động, tài khoản Auth của A | Chưa chạy |
| T13 | Truy cập đường dẫn SPA, reload URL con | Không trả 404 do Hosting rewrite | Chưa chạy |
| T14 | Đánh giá quyền riêng tư trẻ em, chi phí AI, nội dung | Có quy trình và chính sách được phê duyệt trước phát hành | Chưa chạy |

## G. Những gì chưa đạt trước khi công khai

- Chưa có bằng chứng phụ huynh A/B hay giáo viên đã thử Firebase thật.
- Chưa có hồ sơ giáo viên duyệt từng bài, từng đáp án theo sách Kết nối tri thức với cuộc sống.
- Điểm XP và kết quả bài luyện vẫn nhập từ trình duyệt, **chưa chống sửa điểm**. Chỉ dùng để gợi ý học tập cá nhân, không dùng thi cử/thi đua.
- Chưa thiết lập App Check hoạt động, chặn lạm dụng nhiều tài khoản, bộ lọc nội dung AI đầy đủ, chính sách quyền riêng tư và quản lý chi phí.

Nguồn tham khảo: [Google sign-in Firebase](https://firebase.google.com/docs/auth/web/google-signin), [Emulator Suite](https://firebase.google.com/docs/emulator-suite/install_and_configure), [Firebase Functions](https://firebase.google.com/docs/functions/get-started), [Cloud Functions pricing](https://firebase.google.com/docs/functions/quotas).
