> **Lưu trữ V3:** Tài liệu này ghi lại trạng thái V3. V4 đã chuyển Gemini lên Functions và phân quyền qua custom claims. Xem README.md và docs/V4_QUY_TRINH_QUAN_TRI.md để có thông tin đang áp dụng.

# Kế hoạch đối chiếu học liệu Học Vui lớp 1–5

## Mục tiêu

Xây dựng ngân hàng **bài học theo từng bài, trang sách giáo khoa** nhưng KHÔNG tự nhận rằng các chủ đề gợi ý trong `curriculum.ts` là danh mục bài học chính thức.

### Nguồn quy chiếu

- CTGDPT 2018 — văn bản hợp nhất chương trình tổng thể: https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1483/vbhn-chuong-trinh-tong-the.pdf
- Quyết định 3588/QĐ-BGDĐT (26/12/2025) — sách Kết nối tri thức với cuộc sống dùng thống nhất từ năm học 2026–2027: https://www2.en.baochinhphu.vn/ket-noi-tri-thuc-voi-cuoc-song-la-sach-giao-khoa-thong-nhat-toan-quoc-tu-nam-hoc-20262027-10225122622052997.htm
- Website chủ dự án (ý tưởng luyện so sánh số): https://lebangdinh.github.io/toantieuhoc/

## Thực trạng bản này

- `src/services/questionBank.ts`: 19 chủ đề Toán lớp 1–5, 5 chủ đề Tiếng Việt, 5 chủ đề Tiếng Anh có bài tự biên soạn, dùng được mà không gọi AI.
- Bộ Toán: 10 câu/lượt, sinh ngẫu nhiên hoặc chọn mẫu cố định với đáp án theo quy tắc. Tiếng Việt và Tiếng Anh: 8 câu/lượt, lựa chọn từ danh sách bài soạn trước.
- Các chủ đề còn lại tiếp tục tạo 5 câu bằng Gemini khi có cấu hình và kết nối. Kết quả AI có nhãn riêng, không được nhận là đã kiểm định.
- Câu hỏi Ngữ văn, ngoại ngữ, hình học vẫn cần **giáo viên đọc duyệt**. Kiểm thử toán tự động không tương đương chứng nhận sư phạm.
- **Không có** mapping bài/trang SGK hay mã yêu cầu cần đạt đã được xác minh. File `content/alignment-review-queue.json` được tạo để bổ sung chứng cứ và kết quả kiểm duyệt, đang để `null` / `pending` thay vì bịa dữ liệu.

## Quy trình thẩm định đề nghị

1. Đối chiếu mục lục SGK *Kết nối tri thức với cuộc sống* bản đang sử dụng cho từng lớp, từng môn (không lấy tên chủ đề khung làm tên bài chính thức).
2. Lập bản ghi `lớp → môn → chương/chủ đề SGK → bài → số trang → yêu cầu cần đạt → mẫu câu hỏi`.
3. Cho giáo viên duyệt phạm vi kiến thức, lời giải, duy nhất một đáp án và tính sư phạm. Ghi tên và ngày duyệt.
4. Chỉ chuyển cờ `teacherReview` sang `approved` khi có hồ sơ thẩm định; kiểm tra tự động vẫn là lớp kiểm thử bổ sung.
5. Bật báo cáo đánh giá chính thức **chỉ khi** ngân hàng đã được thẩm định; tách riêng điểm luyện tập AI với điểm kiểm tra của bộ bài đã duyệt.

## Cảnh báo triển khai

**Mã Gemini hiện gọi trực tiếp từ trình duyệt** và Vite inject API key qua biến build. Không đưa bản hiện tại lên môi trường công khai/thương mại khi chưa chuyển API call sang server có xác thực và giới hạn quota. Cần kiểm thử Firebase Auth, Firestore Rules, và build React đầy đủ trước khi triển khai.

## Kết quả rà soát V3 (08/10/2026)

- `content/alignment-review-queue.json`: 102 hồ sơ chủ đề ứng dụng. **Chưa phải 102 bài theo mục lục SGK**.
- `content/sgk-math-alignment.json`: 17 tên bài/chủ đề Toán có đầu mối tra cứu từ nguồn thứ cấp; mỗi bản ghi lưu nguồn và chưa xác nhận trang SGK.
- Đã đối chiếu **YCCĐ Toán cấp chủ đề** cho 19 nhóm với văn bản CTGDPT môn Toán kèm TT 32/2018. Các bản ghi có `yccdVerification: official_math_subject_checked_partial`, đường dẫn nguồn và tóm lược do nhóm ứng dụng viết; đây không phải mã YCCĐ chính thức hay xác nhận hoàn chỉnh từng câu.
- Phát hiện và loại khỏi bài Toán lớp 4 các công thức diện tích hình bình hành/hình thoi vì YCCĐ lớp 4 chỉ đòi nhận biết các hình này ở phần hình học trực quan. Chưa đánh dấu bản đó là đạt chuẩn sư phạm.
- `content/extra-practice-bank.json`: 18 nhóm bổ sung, 90 câu tự biên soạn; `src/services/questionBank.ts` và `src/components/LearningModule.tsx` dùng ngân hàng này ở chế độ luyện tập.
- Phần "Tự thử sức" bị khóa với kho chưa có hồ sơ giáo viên duyệt. **Điểm XP của bài luyện thử không phải kết quả kiểm tra học tập chính thức.**
- `scripts/review-content.cjs`: công cụ CLI dành cho quản trị kho mã nguồn ghi người duyệt, bằng chứng, bài SGK, nguồn YCCĐ và nhật ký các hành động. Việc chạy lệnh là tự khai báo, **chưa có cơ chế xác thực danh tính hoặc chữ ký số giáo viên**.
- `scripts/build-content-index.cjs` và `scripts/validate-content.cjs`: tính SHA256 của kho và chặn duyệt cũ khi nguồn nội dung đổi, kiểm tra cấu trúc.
- Cần thu thập **bản SGK được cấp phép từ nhà xuất bản và ý kiến giáo viên** để xác minh đủ 102 chủ đề, từng bài và từng trang; các môn ngoài Toán chưa đối chiếu YCCĐ văn bản riêng trong V3.

Chạy `npm run validate:content` để xác minh dấu vân tay và cấu trúc kho; `node scripts/review-content.cjs report` để xem tiến độ. Xem phần cuối `README.md` về quy trình thẩm định. Không đưa ứng dụng lên production khi chưa chuyển khóa Gemini về backend, xác minh Firebase Auth/rules và chạy build React đầy đủ.
