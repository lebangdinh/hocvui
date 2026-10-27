# Dọn repo GitHub trước khi đưa V11 sạch lên

Bản ZIP đã loại toàn bộ dữ liệu, metadata và báo cáo thừa V6–V9 trong gói. **GitHub Upload không tự xóa các file cũ trên nhánh `main`**. Nếu chỉ tải ZIP lên thì chúng vẫn còn trên repo.

1. Tạo nhánh sao lưu từ `main` (ví dụ `backup-before-v11-clean`).
2. Mở repo `lebangdinh/hocvui` và xóa những file cũ theo danh sách bên dưới, đặc biệt ở `content/`, `scripts/`, `docs/`, `.github/workflows/`. Chỉ xóa file đã đối chiếu chính xác, không xóa toàn bộ thư mục hay cấu hình Firebase.
3. Tải **nội dung bên trong** thư mục `hocvui-main` trong ZIP lên root repo (không tải ZIP), giữ cấu trúc thư mục.
4. Xóa tiếp hai tệp cũ `content/extra-practice-bank.json`, `content/ai-screening-manifest.json` sau khi đã thấy file thay thế `content/practice-bank-v11.json` có trên repo.
5. Đổi workflow `.github/workflows/deploy-hocvui-v5.yml` thành `deploy-hocvui-v11.yml` (xóa tên cũ).
6. GitHub Actions phải vượt `npm run test:offline`, `npm run test:v11`, `npm run lint`, `npm run build`, sau đó mới dùng GitHub Pages bản mới. Không xóa dữ liệu người học/Firebase.

## File gốc V6–V9 cần xóa trên repo nếu còn

```
content/v6-expansion-report.json
content/v6-topic-inventory.csv
content/v7-ai-screening-report.json
content/v7-ai-screening-topic-summary.csv
content/v8-no-repeat-report.json
content/v8-no-repeat-test-result.json
content/v8-topic-summary.csv
content/v9-no-repeat-test-result.json
content/extra-practice-bank.json
content/ai-screening-manifest.json
scripts/expand-primary-question-bank.py
scripts/ai-screen-primary-bank.py
scripts/build-v8-quality-bank.py
scripts/curated-v8-items.txt
scripts/curated-v8-reading.txt
scripts/test-v8-no-repeat.cjs
scripts/test-v9-mixed-rotation.cjs
scripts/test-ai-screening.cjs
scripts/validate-expanded-bank.cjs
scripts/extend-bank-v4.cjs
scripts/extend-practical-v4.cjs
scripts/build-vietnamese-grade1-bank.py
docs/V6_MO_RONG_NGAN_HANG_CAU_HOI_1_5_2026-10-27.md
HUONG_DAN_V7_AI_SO_TUYEN.md
V7_RELEASE_NOTES.md
HUONG_DAN_V9_CHONG_TRUNG_LUYEN_TAP_CHUNG.md
.github/workflows/deploy-hocvui-v5.yml
```

File `metadata.json` mới ghi đúng V11. File `content/practice-bank-v11.json` **chỉ chứa câu đã qua AI sơ tuyển**.

Lịch sử câu trên trình duyệt/Firebase không nằm trong tập dữ liệu tĩnh này và không bị xóa. Các ID được chuyển sang ID băm ổn định theo nội dung; hệ thống vẫn đọc lịch sử văn bản câu hỏi cũ để giảm nguy cơ lặp sau cập nhật.
