# Gấu Nhỏ: giải thích câu sai

## Hành vi

Sau khi chọn đáp án sai, bé có thể nhấn “Nhờ Gấu giải thích thêm”.
Yêu cầu gửi câu đang học, các lựa chọn, đáp án tham khảo, lời giải và lựa chọn của bé.
Không gửi lịch sử các bé hoặc tên/email của phụ huynh vào lời nhắc Gemini.
Máy chủ xác thực người đăng nhập, quyền sở hữu hồ sơ, trạng thái hồ sơ,
lớp và chủ đề trước khi gọi Gemini. Dữ liệu bài học là dữ liệu tham khảo,
không phải system instruction; AI phải nói rõ khi phát hiện đáp án mâu thuẫn.

Dùng chung giới hạn askStudyBear hiện có: 40 lượt/ngày/tài khoản,
giãn tối thiểu 2,5 giây. Ngày hạn mức hiện theo UTC. Không tăng hạn mức.
Client chỉ ghi nhãn AI khi máy chủ xác nhận `contextApplied: true`.
Bấm lặp không tạo yêu cầu mới khi đang chờ; rời câu/đổi hồ sơ bỏ phản hồi cũ.
Lời giải có sẵn vẫn hiển thị khi dịch vụ lỗi và không được ghi nhãn AI.

## Triển khai còn cần xác thực

GitHub Pages chỉ phát hành giao diện; không triển khai Firebase Functions.
Máy chủ cần triển khai lại `askStudyBear` của codebase `hoc-vui`,
vùng `asia-southeast1`, đúng project `hoc-vui-tieu-hoc-2026`.
Bí mật `GEMINI_API_KEY` phải được cấu hình ở máy chủ; không đưa vào frontend,
GitHub hoặc hội thoại. Guard triển khai dùng `HOC_VUI_STAGING_PROJECT_ID`
khớp với project trên. Không cần đổi Firestore Rules cho tính năng này.

Ngày 10/10/2026: kiểm tra URL askStudyBear trả HTTP 404; Firebase CLI
trong môi trường làm việc chưa đăng nhập. Chưa nghiệm thu phản hồi Gemini thật.
Plugin Firebase đã được đề xuất để chủ dự án kết nối và tiếp tục triển khai.
Sau kết nối, kiểm tra project/secret, triển khai riêng callable, rồi nghiệm thu
với một hồ sơ thuộc tài khoản đã đăng nhập. Không coi mock test là test trực tiếp.

## Kiểm thử

`npm run test:offline` gồm kiểm thử context, ownership, hồ sơ đã xóa,
input không hợp lệ, hạn mức/cooldown và không đưa tên/mã hồ sơ vào prompt.
`npm run lint` và `npm run build` kiểm tra frontend.
Đã kiểm tra trình duyệt với dịch vụ giả lập ở 360/1280 px: thành công,
mất kết nối, hết hạn mức, bấm hai lần và phản hồi về sau khi đổi hồ sơ.
