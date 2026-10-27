# Khắc phục câu hỏi lặp – Tiếng Việt lớp 1 (27/10/2026)

## Nguyên nhân đã xác minh

- Chủ đề `1-vietnamese-1` chỉ có 10 câu, mỗi bài chọn 8 câu. Mọi cặp bài có ít nhất 6/8 câu trùng nhau (75%).
- Chủ đề `1-vietnamese-2` và `1-vietnamese-3` mỗi chủ đề chỉ có 5 câu, mỗi bài đưa đủ 5 câu => trùng 100% khi làm lại.
- Trước đây chỉ `shuffle` ngẫu nhiên; không có vòng quay câu hỏi theo hồ sơ, nên không ưu tiên câu mới.
- Phần còn lại cũng bị giới hạn: 71 chủ đề ngân hàng bổ sung khác chỉ có 4–5 câu mỗi chủ đề; không thể khắc phục hoàn toàn nếu không bổ sung học liệu mới.

## Phạm vi sửa trong bản thử nghiệm

| Chủ đề Tiếng Việt lớp 1 | Trước | Sau | Kết quả kiểm thử |
| --- | ---: | ---: | --- |
| Chữ cái và âm vần | 10 | **88** | 9 lượt liên tiếp, mỗi lượt 8 câu, không trùng câu chữ |
| Đọc hiểu câu ngắn | 5 | **75** | 9 lượt liên tiếp không trùng; mỗi lượt 8 đoạn đọc khác nhau |
| Viết câu ngắn | 5 | **80** | 9 lượt liên tiếp không trùng; xen kẽ các dạng bài viết câu |
| **Tổng** | **20** | **243** | **216 câu được thử qua 27 lượt, không gặp lại câu cũ** |

Các câu gồm dạng chữ in hoa/thường, vần, dấu thanh, ghép tiếng; đọc hiểu đoạn ngắn; dấu câu, viết hoa, điền từ, chính tả và sắp xếp câu. Nội dung tự biên soạn, không sao chép nguyên văn SGK. Chưa thay thế bước thẩm định bởi giáo viên.

## Quy tắc quay vòng câu hỏi

- Trong cùng **hồ sơ học sinh + chủ đề**, ưu tiên câu chưa xuất hiện; chỉ quay lại câu cũ sau khi ngân hàng đã dùng hết, bắt đầu từ câu ít gặp gần đây nhất.
- Câu được nhận dạng bằng nội dung chuẩn hóa, không bằng ID tạo ngẫu nhiên hoặc thứ tự đáp án.
- Cân bằng nhóm dạng bài; trong bài đọc hiểu, tránh dùng hai câu có cùng một đoạn đọc nếu còn đoạn khác.
- Lưu lịch sử quay vòng trong `localStorage` theo từng hồ sơ (không trộn giữa các em). Có dự phòng bộ nhớ khi localStorage bị chặn.
- **Giới hạn rõ ràng:** lịch sử này chỉ đồng bộ trong cùng trình duyệt/thiết bị. Xóa dữ liệu trình duyệt hoặc chuyển sang thiết bị khác sẽ bắt đầu vòng quay mới. Không ảnh hưởng phần lưu điểm và lịch sử học Firebase.
- Các chủ đề có 4–5 câu vẫn phải lặp khi làm hết 4–5 câu: thuật toán không thể tự tạo học liệu mới. Không tuyên bố toàn bộ môn/lớp đã hết lặp.

## Các file thay đổi

- `content/extra-practice-bank.json`: 3 ngân hàng Tiếng Việt lớp 1.
- `scripts/build-vietnamese-grade1-bank.py`: nguồn tự biên soạn có thể tái tạo học liệu.
- `src/services/questionRotation.ts`: cơ chế chọn câu/ghi nhớ theo hồ sơ.
- `src/services/questionBank.ts`, `src/components/LearningModule.tsx`: tích hợp vòng quay vào bài luyện.
- `scripts/validate-bank.cjs`, `scripts/validate-content.cjs`: tự động phát hiện câu lặp và kiểm tra 9 lượt.
- `content/bank-fingerprint.json`: cập nhật dấu vân tay nội dung; mọi phê duyệt cũ liên quan nội dung chỉnh sửa phải được xem lại, không tự cấp phép.

## Kiểm thử

```bash
npm ci
npm run validate:content
npm run test:bank
npm run lint
npm run build
```

Nên kiểm tra thủ công với 1 hồ sơ thử nghiệm: vào từng chủ đề Tiếng Việt lớp 1, làm 9 lượt liên tiếp, quan sát nhóm dạng bài và câu trả lời; tắt/mở lại trình duyệt rồi làm thêm. Nên để giáo viên tiểu học rà soát trước khi triển khai chính thức.

**Triển khai an toàn:** tải ZIP này lên repo nhánh mới hoặc dự án thử nghiệm; không ghi đè bản đang chạy và không tự đẩy lên Firebase từ gói này.
