# Gấu Nhỏ: Cloudflare Workers AI

Giao diện gọi `https://hocvui-gau-nho.lebangdinh.workers.dev/chat` bằng
Firebase ID token. Worker xác minh chữ ký RS256, issuer, audience, thời hạn;
đọc hồ sơ đúng đường dẫn chủ sở hữu qua Firestore REST bằng token của người dùng.
Kiểm tra uid/id, lớp 1–5, hồ sơ chưa vào thùng rác, nội dung và chủ đề hợp lệ.
Không cần đổi Firestore Rules, bật Blaze, hay đưa khóa AI vào trình duyệt.

Model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Không dùng Gemini cho Gấu Nhỏ.
Các Firebase callables cũ vẫn còn trong repo nhưng chat không gọi chúng.
Việc tạo câu hỏi qua callable cũ không nằm trong đợt triển khai này.

## Triển khai Worker bằng dashboard

1. Mở Worker `hocvui-gau-nho`, chọn Edit code.
2. Thay toàn bộ mã bằng `cloudflare/worker.js`, rồi Deploy.
3. Giữ binding Workers AI tên `AI`; D1 tên `DB` trỏ tới `hocvui-ai-quota`.
   Bảng trong `cloudflare/schema.sql` đã được người vận hành tạo.
4. Mở URL gốc. Phải thấy `phienBan: hocvui-ai-v1`, cả hai binding true.
   GET này không gọi AI và không chứng minh AI đã chạy.
5. Khi giao diện mới đã lên GitHub Pages, đăng nhập và chọn hồ sơ học sinh,
   bấm Kiểm tra AI. Sau vài giây hỏi một câu học tập; thử giải thích một câu sai.

Không bật Upgrade/billing. Free tier là hạn mức dùng chung tài khoản Cloudflare,
không bảo đảm mọi tài khoản học sinh đều dùng đủ 40 lượt. Hết hạn mức nhà cung cấp
hoặc lỗi DB/AI sẽ trả lỗi; giao diện giữ bài học và lời giải soạn sẵn.

## Hạn mức và dữ liệu

D1 giữ một dòng mỗi tài khoản: SHA-256 của project + uid (mã giả danh,
không phải dữ liệu ẩn danh tuyệt đối), ngày, số lượt, thời điểm cuối.
Không ghi câu hỏi, câu trả lời, tên bé hay token vào D1/log của mã ứng dụng.
Lời nhắc AI chứa lớp, tối đa 6 lượt hội thoại gần nhất, hoặc câu sai và đáp án.
Không gửi lịch sử vào yêu cầu giải thích câu sai, không gửi tên/email/profileId
vào lời nhắc. Giao diện thông báo dữ liệu bài học được gửi tới Cloudflare AI.
Nhà cung cấp vẫn xử lý dữ liệu theo điều khoản riêng; không cam kết không lưu
ở mọi lớp hạ tầng. Wrangler tắt observability; nếu dùng dashboard, người vận hành
có thể kiểm tra riêng cấu hình log hiện có.

Giới hạn 40 lần thử gọi AI/ngày/tài khoản, đặt lại theo ngày Việt Nam (UTC+7),
giãn 2,5 giây. Một UPSERT có điều kiện và RETURNING bảo vệ đồng thời; lỗi D1
không được bỏ qua. Lượt đã đặt trước vẫn tính nếu AI lỗi hoặc client hết thời gian.
Bấm Kiểm tra AI cũng dùng một lượt. Phản hồi cũ bị bỏ khi đổi hồ sơ/rời câu.

## Kiểm tra và trạng thái

`node scripts/test-cloudflare-worker.mjs` kiểm tra JWT có chữ ký thật bằng khóa
kiểm thử; sai chữ ký/project/hết hạn; ownership/thùng rác; giới hạn body/CORS;
prompt câu sai; quota nguyên tử/cooldown/reset qua SQLite. AI, Firestore và JWKS
được giả lập: không phải kiểm thử AI thật hoặc D1 triển khai.
`npm run lint`, `npm run build`, và kiểm thử trả lời cơ bản kiểm tra frontend.

Ngày 10/10/2026: người vận hành đã chạy thành công Worker thử model Llama,
tạo bảng D1 và gắn AI/DB. Worker bảo vệ ở trên và luồng đăng nhập thật còn cần
người vận hành Deploy và nghiệm thu. Không coi thành công của bản thử GET là
nghiệm thu bản tích hợp.
