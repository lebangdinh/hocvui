const fs=require('node:fs');
const queue=require('../content/alignment-review-queue.json');
const subjectNames={math:'Toán',vietnamese:'Tiếng Việt',english:'Tiếng Anh',nature:'Tự nhiên và Xã hội',ethics:'Đạo đức',science:'Khoa học',history_geo:'Lịch sử và Địa lí',it:'Tin học và Công nghệ',physical:'Giáo dục thể chất',arts:'Nghệ thuật',experiential:'Hoạt động trải nghiệm'};
const rows=['# V5: Đối chiếu nội dung theo lớp/môn — trạng thái trung thực','','**Lưu ý:** Đây là 102 *chủ đề ứng dụng*, không phải 102 bài chính thức của SGK. 0 hồ sơ được giáo viên duyệt. Tên chủ đề hiện dùng là định hướng biên tập; các YCCĐ ngoài Toán chưa được đối chiếu văn bản môn học đầy đủ.','','| Lớp | Môn | Chủ đề có bài / tổng | Bài SGK và yêu cầu cần đạt |','|---|---|---:|---|'];
for (let grade=1;grade<=5;grade++) for(const [key,name] of Object.entries(subjectNames)){
 const list=queue.items.filter(t=>t.grade===grade&&t.subject===key);if(!list.length)continue;
 const has=list.filter(t=>t.questionMode==='local_bank').length;
 const aligned=list.some(t=>t.yccdVerification==='official_math_subject_checked_partial');
 rows.push(`| ${grade} | ${name} | ${has}/${list.length} | ${aligned?'Toán: YCCĐ sơ bộ ở cấp chủ đề; chưa xác minh từng câu/trang SGK':'Chờ đối chiếu chi tiết SGK và YCCĐ'} |`);
}
rows.push('','## Nguồn và mức độ xác minh','','- [Thông tư 32/2018/TT-BGDĐT (CSDL VBPL quốc gia)](https://vbpl.moj.gov.vn/bogiaoducdaotao/Pages/vbpq-toanvan.aspx?ItemID=146721): khung chương trình, văn bản có điều chỉnh một phần.','- [Quyết định 3588/QĐ-BGDĐT](https://thuvienphapluat.vn/van-ban/Giao-duc/Decision-3588-QD-BGDDT-2025-General-education-textbooks-for-use-nationwide-696053.aspx): sách Kết nối tri thức với cuộc sống cho năm học 2026–2027.','- `content/alignment-review-queue.json`: hồ sơ nguồn/chủ đề. `content/sgk-math-alignment.json`: 17 đầu mục Toán từ nguồn thứ cấp, chưa xác minh ở bản SGK gốc.','','**Trước khi phát hành học liệu chính thức:** đối chiếu trực tiếp SGK được phép sử dụng của từng môn/lớp; xác nhận từng bài, trang, mã YCCĐ; đọc duyệt từng câu/đáp án bởi giáo viên; ghi hồ sơ duyệt qua cổng quản trị.');
fs.writeFileSync('docs/V5_DO_PHU_VA_DOI_CHIEU_1-5.md',rows.join('\n')+'\n');
console.log('Coverage matrix saved: docs/V5_DO_PHU_VA_DOI_CHIEU_1-5.md');
