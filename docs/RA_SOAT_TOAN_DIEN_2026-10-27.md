# Rà soát Học Vui – 27/10/2026

## Kết luận và việc cần kiểm tra đầu tiên

Đã rà soát mã nguồn frontend, luồng lưu dữ liệu, trò chơi, backend AI, quy tắc Firestore, cấu hình build/deploy và thư viện phụ thuộc. Đã sửa các lỗi xác định được trong nguồn và bổ sung kiểm thử. Đây là bản để thử nghiệm, chưa được phát hành lên website đang dùng.

**Không thể chứng minh “không còn bất kỳ lỗi nào”.** Chưa có log lỗi người dùng, truy cập quản trị Firebase, tài khoản thử hoặc số đo từ thiết bị thực tế. Không được coi các kiểm thử mock là kiểm chứng Firebase thật.

**Ưu tiên số 1: xác nhận người dùng đang mở đúng bản app.** Dự án có hai đầu vào:

| Đầu vào | Nội dung | Khả năng lưu lịch sử |
|---|---|---|
| `index.html` ở gốc | HTML bản lớp 1 cũ | Không có localStorage, sessionStorage hay Firebase trong nguồn này |
| `vite-entry.html` → build → `dist/index.html` | React/Firebase lớp 1–5 | Có lưu hoạt động vào Firestore và hàng đợi chờ đồng bộ |

Nếu Pages đang phát hành từ nhánh/thư mục gốc, sửa React sẽ không thay đổi bản HTML cũ người dùng đang mở. Cần xem **Settings → Pages → Source**, chọn **GitHub Actions**, và kiểm tra workflow mới đã thành công. Trong lần rà soát này, công cụ truy cập trang công khai không truy cập được URL nên chưa xác nhận bản nào đang được phục vụ.

## Các lỗi đã sửa trong nguồn

| Nhóm | Vấn đề xác định được | Thay đổi |
|---|---|---|
| Lưu bài | Phải đọc toàn bộ lịch sử tài khoản trước khi lưu | Kiểm tra bài theo ID; truy vấn ngưỡng huy hiệu giới hạn 9/4 bản ghi |
| Lưu bài | Kết quả chưa lưu mất khi reload/đóng trang | Ghi hàng đợi trên trình duyệt trước khi gọi mạng; thử lại theo đúng tài khoản |
| Lưu bài | Có thể lưu thành công nhưng mất phản hồi | Giữ ID ổn định, kiểm tra lại bài đã tồn tại; giao dịch + create-only rules ngăn cộng trùng |
| Lưu bài | Thành công qua đồng bộ nền nhưng màn hình còn báo lỗi | Phát sự kiện xác nhận để cập nhật màn hình kết quả và báo cáo đúng hồ sơ |
| Lưu bài | Chờ mạng kéo dài không có điểm dừng trên màn hình | Thêm thời hạn chờ; không giả định thao tác ghi đã bị hủy khi hết hạn |
| Lưu bài | Bản chờ sai định dạng bị bỏ qua âm thầm | Kiểm tra dữ liệu và hiển thị số bản hỏng; giữ nguyên dữ liệu để xử lý |
| Lưu bài | Xóa bản chờ thất bại bị hiểu nhầm là server chưa lưu | Xác nhận thành công độc lập với dọn localStorage; lần thử sau vẫn kiểm tra trùng |
| Xóa dữ liệu | Bản chờ còn trên máy sau khi xóa vĩnh viễn thành công | Dọn bản chờ đúng hồ sơ/tài khoản sau xác nhận; chuyển vào Thùng rác không dọn |
| Báo cáo | Tải cả dữ liệu của các bé khác trong cùng tài khoản | Truy vấn cả userId và profileId; vẫn kiểm tra quyền sở hữu ở lớp tạo báo cáo |
| Bài học | Hết giờ dùng chuỗi rỗng, kiểm tra truthy sai | Dùng null để phân biệt chưa trả lời; hết giờ khóa đáp án và hiện nút tiếp tục |
| Bài học | Bấm đáp án hoặc tiếp tục quá nhanh | Chốt bằng ref đồng bộ, tránh cộng điểm nhiều lần hoặc bỏ qua câu |
| Bài học | Nhấn gợi ý liên tiếp có thể trừ sao nhiều lần | Khóa yêu cầu đang chạy; báo lỗi rõ; không áp lời gợi ý cũ sang câu mới |
| Bài học | Đồng hồ đếm tick có thể sai khi tab bị giảm tần suất | Tính theo mốc thời gian thực và kiểm tra lại khi quay về cửa sổ |
| Bài học | Thay đổi trạng thái duyệt làm tạo lại đề đang học | Giữ đề sau khi tải thành công; bỏ phản hồi AI cũ khi màn hình đã rời |
| Hồ sơ | Đổi tài khoản/hồ sơ/lớp giữ màn hình học cũ | Tách vòng đời Dashboard theo uid, profileId và lớp |
| Hồ sơ | localStorage bị chặn làm lỗi thao tác chọn hồ sơ | Chọn hồ sơ vẫn hoạt động khi lưu tùy chọn không khả dụng |
| Hồ sơ | Mã huy hiệu yêu thích không tồn tại làm crash | Kiểm tra mã trước khi lấy icon ở danh sách và header |
| Giao diện | Lỗi đăng nhập, đổi lớp, đổi huy hiệu không hiện rõ | Bổ sung trạng thái và thông báo lỗi |
| Giao diện | Lỗi tải module/render có thể trắng toàn màn hình | Error boundary với nút tải lại; hàng đợi không bị xóa |
| Hiệu năng | Tải ngay game, biểu đồ, quản trị, ngân hàng, chatbot | Tách module theo chức năng; giảm JS đầu vào |
| Game | Di chuột làm render lại toàn bộ cây game | Bỏ cập nhật state trang game theo từng mousemove; cố định tham số sao nền |
| Game | Tốc độ mô phỏng tăng theo tần số quét | Giới hạn bước ở 60 Hz, kiểm thử cả 60/120/144 Hz |
| Game | Xe lệch vị trí chạm khi canvas co trên điện thoại | Quy đổi từ tọa độ CSS sang kích thước canvas |
| Game | Phím bị giữ sau khi chuyển cửa sổ | Xóa trạng thái phím khi mất focus và khi khởi động lại |
| Game | Lật nhanh ba thẻ hoặc cùng thẻ gây kẹt | Khóa lựa chọn tức thời, tối đa hai thẻ trong một lượt |
| Game | Sao và huy hiệu lưu tách rời; lỗi Promise không được xử lý | Ghi sao/huy hiệu bằng một giao dịch; thông báo thành công/lỗi; chặn gọi thưởng lại do render |
| Giao diện game | Tailwind không sinh các lớp màu nối chuỗi | Khai báo các lớp màu động để có trong bản production |
| Âm thanh/hiệu ứng | Pháo giấy nhiều, không tôn trọng reduced motion | Giảm số hạt ở các hiệu ứng chính; bật tùy chọn reduced motion |
| Chatbot | Danh sách hội thoại trong DOM tăng không giới hạn | Giữ tối đa 80 tin nhắn hiển thị; lịch sử gửi AI vẫn giới hạn riêng |
| Quản trị | Checklist duyệt cũ được mang sang chủ đề mới | Reset hồ sơ kiểm duyệt/checklist khi đổi chủ đề; không đổi chủ đề khi đang gửi |
| Quản trị | Refresh thất bại bị báo như thao tác duyệt thất bại | Phân biệt server đã xác nhận với lỗi tải lại danh sách |
| Thùng rác | Thiếu/hỏng mốc hết hạn bị coi là hết hạn để tự xóa | Chỉ tự dọn khi có timestamp hợp lệ và đã hết hạn; kiểm tra tài khoản giữa các hồ sơ |
| Backend | Endpoint sinh bài vẫn dùng được hồ sơ đã vào Thùng rác | Chặn cả deletedAt và deleteAfter; từ chối profileId chứa dấu / |
| Backend | Callable xóa hồ sơ bỏ qua yêu cầu vào Thùng rác | Yêu cầu đủ dấu mốc Thùng rác trước khi cho xóa vĩnh viễn |
| Riêng tư | Log lỗi Firebase chứa thông tin tài khoản/hồ sơ | Log loại thao tác và mã lỗi, giữ mã lỗi để UI xử lý |
| Chạy local | `npm run dev` ở `/` hiển thị HTML cũ | Middleware local dùng cùng React entry như build |
| Phụ thuộc | Nhiều gói cũ và gói server không được nguồn frontend dùng | Cập nhật tương thích; bỏ express, @types/express, @google/genai, dotenv ở root; dependencies Functions riêng được giữ |

## Kết quả kiểm thử và giới hạn của bằng chứng

- `npm run test:audit`: bộ kiểm thử offline, callable mock, Cloudflare mock, game/âm thanh, Thùng rác, hàng đợi, UI React, bộ bảo vệ runtime, điểm, session, báo cáo và nội dung; kèm TypeScript.
- Test UI chạy component React thật với Firebase/âm thanh được thay bằng mock. Đã thử bấm gợi ý hai lần, hết giờ, đáp án sau hết giờ, bấm tiếp tục hai lần, lưu cuối bài một lần, xác nhận đồng bộ nền đúng tài khoản, lỗi thưởng game và lật thẻ quá nhanh.
- Test hàng đợi: offline, khởi tạo lại module như reload, đổi tài khoản, lưu lặp/đồng thời, commit xong nhưng mất phản hồi, bản chờ hỏng, lỗi dung lượng và dọn theo hồ sơ sau xóa vĩnh viễn.
- Test nguồn ngân hàng: 102 chủ đề, 3.265 lượt đề và 30.350 câu qua kiểm tra cấu trúc; 25.200 câu có phép tính được xác minh bởi script. Không thay thế thẩm định của giáo viên với nội dung ngôn ngữ hoặc bài toán lời văn.
- Build production cho `/hocvui/` và kiểm tra cài lại bằng lockfile.
- Kích thước JS entry giảm từ khoảng **1,49 MB xuống 1,03 MB** chưa nén (gzip khoảng **379 KB xuống 278 KB**) so với bản sửa trước trong phiên này. Đây là số đo bundle, không phải số đo FPS hay tốc độ tải trên máy người dùng. Bundle chính vẫn còn lớn.
- Chưa kiểm thử trình duyệt thực tế: có thử chuẩn bị Chromium nhưng tải bộ trình duyệt không thành công. Không có kết quả xác nhận bố cục, cảm ứng hoặc đăng nhập popup trên Chrome/Safari thật.
- Chưa chạy Firebase Emulator Suite, chưa đăng nhập Firebase thật, chưa gọi AI thật, chưa kiểm tra GitHub Actions trên repository của anh.

## Thư viện phụ thuộc

Lệnh kiểm tra: `npm audit --omit=dev`, chạy trong thư mục gốc. Kết quả tại thời điểm rà soát:

| Mức | Trước cập nhật | Sau cập nhật tương thích và bỏ gói không dùng |
|---|---:|---:|
| Critical | 3 | 0 |
| High | 10 | 4 |
| Moderate | 5 | 2 |
| Low | 2 | 1 |
| Tổng bản ghi gói bị cảnh báo | 20 | 7 |

Các con số là bản ghi gói/dependency chain; không phải 20 hoặc 7 cách khai thác độc lập đã được xác nhận trên website.

Còn lại: `@grpc/grpc-js` và chuỗi phụ thuộc Firebase (4 bản ghi High), `postcss-selector-parser` và `@tailwindcss/typography` (2 Moderate), `esbuild` (1 Low). Npm đề xuất thay đổi lớn/downgrade Firebase cho một phần các cảnh báo; không chạy `--force` vì có thể làm hỏng app. Các gói gRPC liên quan đường chạy Node, còn parser/esbuild chủ yếu ở bước build/dev; chưa chứng minh đường khai thác trong bản web tĩnh. Vẫn cần xử lý/đánh giá riêng, không gọi hệ thống là “sạch bảo mật”.

Kiểm tra này không bao phủ một cây dependencies đã cài riêng trong `functions/`; thư mục đó chưa có lockfile riêng trong bản gốc. Cần audit môi trường backend triển khai thực tế.

## Các việc còn mở – không được hiểu là đã sửa xong

1. **Xác nhận bản đang online và cấu hình Firebase.** Pages Source, Rules, indexes, authorized domains, Functions và Worker phải đồng bộ. Workflow hiện chỉ phát hành Pages. Backend có thay đổi trong bản này và cần được người quản trị triển khai riêng.
2. **Sao trò chơi khi mất mạng.** Đã sửa ghi atomic và thông báo lỗi, nhưng chưa có hàng đợi bền vững/idempotency receipt cho phần thưởng game. Không tự thử cộng lại khi kết quả commit chưa rõ để tránh cộng trùng. Không cam kết khôi phục thưởng game sau reload.
3. **Bài đang làm dở.** Chỉ giữ bài đã hoàn thành và gọi lưu. Đổi hồ sơ/đóng trang giữa bài chưa khôi phục câu đang làm. Nếu lời gợi ý đang chờ phản hồi lúc hết giờ/đổi câu, có thể đã bị trừ sao nhưng không còn dùng gợi ý; cần thiết kế giao dịch gợi ý theo ID câu nếu muốn xử lý triệt để.
4. **LocalStorage không phải sao lưu cloud.** Xóa dữ liệu trang, đóng phiên riêng tư, đổi máy hoặc lưu trữ bị chặn/đầy vẫn có thể mất bản chưa đồng bộ. Khi lưu trữ bị chặn, app báo lỗi và yêu cầu khắc phục trước khi rời màn hình.
5. **Điểm do client đề xuất.** Rules phân tách tài khoản nhưng chủ tài khoản có thể tự gửi điểm/huy hiệu của mình. Chưa có máy chủ xác thực bài làm để chống sửa điểm. Không dùng mô hình hiện tại cho xếp hạng/đổi thưởng có giá trị mà chưa thiết kế lại.
6. **Hồ sơ đổi lớp/xóa trong lúc có bài chờ.** Giao dịch sẽ từ chối bài không còn khớp hồ sơ. App giữ bản chờ và báo lỗi; chưa có giao diện xử lý xung đột hoặc xuất bản chờ.
7. **Xóa lượng dữ liệu lớn.** Client chỉ xóa atomic tối đa 400 hoạt động. Các endpoint xóa nhiều batch/recursiveDelete không phải giao dịch xuyên toàn bộ tài khoản; mất mạng, timeout hoặc ghi đồng thời cần đối soát lại. Endpoint xóa hồ sơ trên backend vẫn cần cơ chế khóa vòng đời nếu muốn chống việc khôi phục đồng thời lúc đang xóa.
8. **Báo cáo dài hạn.** Đã giới hạn theo hồ sơ nhưng vẫn đọc toàn bộ lịch sử của bé, chưa có phân trang/aggregate server cho hàng chục nghìn lượt.
9. **Hiệu năng thiết bị thật.** Chưa đo FPS, RAM và mạng yếu. Frame gate ngăn màn hình tần số cao làm game chạy nhanh; chưa có cơ chế bù bước mô phỏng đầy đủ cho máy rất yếu. Âm thanh phụ thuộc thiết bị và nguồn nhạc ngoài.
10. **Phụ thuộc và chất lượng nội dung.** Còn 7 cảnh báo audit; cần rà thêm backend. Nội dung chưa được giáo viên duyệt trên server sẽ không mở quiz; việc này là chủ ý, không tự bật để né lỗi.

## Quy trình thử trước khi thay bản chính

1. Tạo nhánh thử từ repository hiện tại; chép nội dung bên trong `hocvui-main/` vào root của nhánh. Không xóa dữ liệu Firestore, không thay khóa/bí mật.
2. Chạy `npm ci`, `npm run test:audit` và build với `VITE_BASE_PATH=/hocvui/`.
3. Kiểm tra Pages đang dùng GitHub Actions. Nếu muốn thử độc lập, dùng môi trường thử có Firebase riêng và cấu hình origin của Worker tương ứng; không giả định repo mới tự có backend riêng.
4. Tài khoản thử: đăng nhập → chọn bé A → làm xong bài → kiểm tra sao/lịch sử → reload. Sau đó thử offline lúc lưu, mở lại cùng trình duyệt và bật mạng, xác nhận chỉ cộng một lần.
5. Đổi bé/tài khoản giữa các màn hình. Thử hết giờ, bấm nhanh, gợi ý, các game trên điện thoại. Kiểm tra bản chờ không xuất hiện ở tài khoản khác.
6. Thử Thùng rác/khôi phục/xóa vĩnh viễn chỉ với hồ sơ test, bao gồm trường hợp có bài chờ.
7. Thử lỗi quyền Firebase, Worker/Functions chưa có và mạng gián đoạn; ghi mã lỗi, thời gian, thao tác, trình duyệt và thiết bị để đối chiếu.
8. Chỉ đưa lên nhánh chính sau khi các bước thực tế đạt yêu cầu. Có thể quay về commit trước; các thay đổi nguồn này không sửa/xóa lịch sử đã có trên server.
