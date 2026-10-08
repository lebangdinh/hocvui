const fs=require('node:fs');
const file='content/extra-practice-bank.json';const data=JSON.parse(fs.readFileSync(file,'utf8'));
// Recognize safe concepts only; exercise does NOT assess practical movement/art performance.
const material={
'1-physical-1':[
['Trước khi vận động, em nên làm gì?','Khởi động nhẹ nhàng','Ngồi yên rất lâu','Ăn quá no rồi chạy','Chạy ngay thật nhanh'],['Khi thấy mệt hoặc đau lúc vận động, em nên làm gì?','Dừng lại và báo người lớn','Cố chạy tiếp','Giấu thầy cô','Uống đồ lạ'],['Khi chơi trò chơi vận động, em cần làm gì?','Tuân thủ luật chơi','Đẩy ngã bạn','Chen lấn','Làm trái hiệu lệnh'],['Nơi nào phù hợp hơn để vận động?','Sân chơi an toàn','Giữa lòng đường','Gần ổ điện hở','Trên mái nhà']],
'2-physical-1':[
['Để chơi cùng nhóm an toàn, em nên làm gì?','Giữ khoảng cách phù hợp','Xô đẩy bạn','Giành mọi lượt','Chạy ngược hướng bất ngờ'],['Khi nghe hiệu lệnh dừng, em nên làm gì?','Dừng theo hướng dẫn','Cố chạy tiếp','Trêu chọc bạn','Bỏ qua'],['Để phòng tránh chấn thương, trước lúc chơi nên?','Khởi động','Nhảy từ nơi cao','Không mang giày phù hợp','Chạy trên nền trơn'],['Khi bạn ngã trong lúc chơi, em nên?','Báo người lớn và giúp theo hướng dẫn','Cười bạn','Giấu chuyện','Chạy qua bạn']],
'3-physical-1':[
['Khi tập thể dục, cách thở nào nên ưu tiên?','Thở đều theo khả năng','Nín thở thật lâu','Thở gấp cố ý','Không chú ý hơi thở'],['Khi tập theo nhóm, em cần?','Tuân thủ hướng dẫn an toàn','Tranh giành dụng cụ','Đùa nghịch nguy hiểm','Cố vượt sức'],['Sau khi vận động, nên làm gì?','Thả lỏng và uống nước phù hợp','Ngồi ngay giữa sân','Dùng thuốc lạ','Chạy thêm dù chóng mặt'],['Nếu dụng cụ thể thao bị hỏng, cần?','Báo người lớn','Cố sử dụng','Giấu đi','Đưa cho bạn nhỏ']],
'4-physical-1':[
['Nguyên tắc an toàn khi vận động là gì?','Tập phù hợp sức khỏe','Luôn cố vượt sức','Không cần nghỉ','Bỏ qua chấn thương'],['Tinh thần thể thao tốt thể hiện qua?','Tôn trọng đối thủ','Chế giễu đối thủ','Gian lận','Không tuân thủ luật'],['Khi cơ thể mất nước sau vận động, nên?','Bổ sung nước phù hợp','Nhịn uống cả ngày','Dùng đồ uống không rõ nguồn','Chỉ ăn kẹo'],['Khi gặp chấn thương, việc đầu tiên nên?','Dừng vận động và báo người lớn','Tiếp tục thi đấu','Tự nắn bẻ khớp','Giấu người giám sát']],
'5-physical-1':[
['Luyện tập đều đặn đem lại điều gì?','Góp phần tăng sức khỏe','Thay thế giấc ngủ','Không cần ăn uống','Không bao giờ cần nghỉ'],['Khi chơi thể thao đồng đội, phẩm chất quan trọng là?','Hợp tác','Ích kỉ','Đổ lỗi','Gian lận'],['Để tránh quá sức, em nên?','Điều chỉnh cường độ và nghỉ khi cần','Không dừng dù đau','Bỏ khởi động','Tập khi sốt'],['Khi thấy bạn chơi không đúng luật, em nên?','Nhắc nhở lịch sự','Xô đẩy bạn','Cãi nhau lớn tiếng','Bỏ mặc luật chơi']],
'1-arts-1':[
['Màu nào trong các màu sau là màu cơ bản?','Màu đỏ','Màu nâu đất','Màu xám','Màu hồng nhạt'],['Dụng cụ nào dùng để vẽ tranh?','Bút màu','Bàn chải đánh răng','Kéo cắt tóc','Cái thìa'],['Âm thanh nào do nhạc cụ tạo ra?','Tiếng trống','Tiếng mưa','Tiếng lá rơi','Tiếng gió'],['Khi nghe bạn hát, em nên làm gì?','Lắng nghe và cổ vũ lịch sự','Nói chuyện ồn ào','Chế giễu bạn','Gào to át tiếng']],
'2-arts-1':[
['Âm nhạc có thể được biểu diễn bằng gì?','Giọng hát và nhạc cụ','Chỉ bằng màu vẽ','Chỉ bằng phép cộng','Chỉ bằng chữ số'],['Để giữ gìn tranh vẽ của bạn, em nên?','Không vẽ lên tranh khi chưa được phép','Xé tranh','Bôi bẩn tranh','Giấu tranh'],['Màu xanh lá cây thường gợi hình ảnh nào?','Lá cây','Than củi','Mây đen','Cát vàng'],['Nhịp đều trong âm nhạc giúp gì?','Giữ tiết tấu ổn định','Làm bài toán nhanh hơn','Thay lời bài hát','Biến chữ thành tranh']],
'3-arts-1':[
['Trong âm nhạc, tiết tấu gắn với yếu tố nào?','Trường độ âm thanh','Độ dài thước','Số trang vở','Nhiệt độ'],['Khi tạo sản phẩm mĩ thuật, em có thể?','Kết hợp hình và màu theo ý tưởng','Chỉ dùng một cách duy nhất','Phải chép y hệt mọi bạn','Không cần giữ an toàn'],['Để thể hiện âm nhạc theo nhóm, cần?','Lắng nghe và phối hợp','Ai cũng hát khác nhịp cố ý','Không luyện tập','Cười bạn sai'],['Khi sử dụng kéo để làm mĩ thuật, em nên?','Dùng cẩn thận theo hướng dẫn','Vung kéo khi chạy','Đùa nghịch bằng kéo','Để kéo mở ở ghế']],
'4-arts-1':[
['Trong tranh phong cảnh, yếu tố nào thường tạo chiều sâu?','Vật gần thường lớn hơn vật xa','Mọi vật đều bằng nhau','Chỉ có một màu','Không có đường nét'],['Để hát đồng đều theo nhóm, cần?','Giữ cùng nhịp và lắng nghe','Mỗi người hát tự do rất nhanh','Hát át người khác','Bỏ qua nhịp'],['Vật liệu tái sử dụng nào có thể dùng làm sản phẩm mĩ thuật khi an toàn?','Giấy sạch','Mảnh kính sắc','Kim tiêm','Hóa chất lạ'],['Khi nhận xét tranh của bạn, nên nói?','Nêu điều mình thích một cách lịch sự','Chê bai cá nhân bạn','Phá tranh','Không cho bạn giải thích']],
'5-arts-1':[
['Sáng tạo trong mĩ thuật có thể thể hiện qua?','Cách phối hình và màu có chủ đích','Chép tranh mà không hiểu','Phá sản phẩm bạn','Bỏ qua ý tưởng'],['Khi biểu diễn nhóm, điều gì quan trọng?','Phối hợp và tôn trọng nhau','Chỉ chú ý riêng mình','Chế giễu bạn','Không nghe hiệu lệnh'],['Hoạt động nào giúp cảm thụ âm nhạc?','Lắng nghe giai điệu và tiết tấu','Chỉ nhìn số trang sách','Đo chiều dài bàn','Đếm viên phấn'],['Khi làm thủ công, em nên ưu tiên?','Vật liệu an toàn, sạch','Vật sắc nhọn không có người hướng dẫn','Dung dịch không rõ nguồn','Đồ dễ cháy']],
'1-experiential-1':[
['Trước khi đến lớp, em nên?','Chuẩn bị đồ dùng học tập','Bỏ quên cặp','Giấu sách của bạn','Đi học không có kế hoạch'],['Khi gặp thầy cô, em nên?','Chào hỏi lễ phép','Bỏ chạy','La hét','Ném đồ'],['Khi làm việc nhóm, em nên?','Chia sẻ và hợp tác','Giành mọi đồ dùng','Không nghe bạn','Chê bai bạn'],['Khi làm đổ nước ở lớp, em nên?','Báo và cùng lau dọn an toàn','Bỏ mặc sàn trơn','Đổ thêm nước','Đổ lỗi cho bạn']],
'2-experiential-1':[
['Để tự chuẩn bị đi học, em cần?','Kiểm tra sách vở theo lịch','Mang đồ bất kì','Không xem thời khóa biểu','Để người khác làm hết'],['Khi nhóm phân công việc, em nên?','Nhận việc phù hợp và thực hiện','Bỏ đi','Chỉ ra lệnh','Không giữ lời'],['Khi bàn học bừa bộn, em nên?','Sắp xếp gọn gàng','Để rác khắp nơi','Giấu đồ bạn','Vẽ lên bàn'],['Nếu không hiểu nhiệm vụ nhóm, em nên?','Hỏi lại rõ ràng','Làm đại','Im lặng rồi bỏ việc','Đổ lỗi cho bạn']],
'3-experiential-1':[
['Thói quen nào thể hiện tự phục vụ?','Tự sắp xếp góc học tập','Chờ nhắc mọi việc','Bỏ quên đồ dùng','Không dọn bàn'],['Khi nhóm gặp khó khăn, em nên?','Cùng tìm cách giải quyết','Bỏ nhóm','Chê bạn','Giấu thông tin'],['Trong hoạt động ngoài trời, em nên?','Tuân thủ hướng dẫn an toàn','Tách khỏi nhóm không báo','Leo nơi nguy hiểm','Đi theo người lạ'],['Muốn góp ý cho bạn, em nên?','Nói nhẹ nhàng, cụ thể','Chê trước lớp','Đổ lỗi','Không nghe giải thích']],
'4-experiential-1':[
['Khi lập kế hoạch học tập, em nên?','Xác định mục tiêu và thời gian','Không cần mục tiêu','Chỉ chơi cả ngày','Không quan tâm tiến độ'],['Khi tham gia hoạt động cộng đồng, nên?','Làm phần việc phù hợp và an toàn','Tự ý dùng đồ nguy hiểm','Không xin phép','Phá đồ chung'],['Để giải quyết mâu thuẫn trong nhóm, nên?','Lắng nghe và tìm cách hòa giải','Cãi vã','Tẩy chay','Đổ lỗi'],['Khi hoàn thành nhiệm vụ, em nên?','Tự đánh giá và rút kinh nghiệm','Không cần xem kết quả','Che giấu lỗi','Chê bạn khác']],
'5-experiential-1':[
['Khi chuẩn bị hoạt động chung, em nên?','Lập kế hoạch và phân công hợp lí','Làm không có kế hoạch','Bỏ mọi việc cho bạn','Giấu thông tin'],['Sau một dự án lớp, hoạt động nào giúp tiến bộ?','Nhìn lại điểm tốt và điều cần cải thiện','Không nhận xét','Đổ lỗi cho một bạn','Chỉ quan tâm phần thưởng'],['Khi xây dựng mục tiêu cá nhân, nên chọn mục tiêu nào?','Rõ ràng và phù hợp khả năng','Không thể thực hiện','Không có thời hạn','Không cần theo dõi'],['Khi tham gia dự án môi trường, nên?','Phân loại rác theo hướng dẫn địa phương','Xả rác bừa bãi','Đốt rác tùy tiện','Ném rác xuống sông']]
};
let count=0;
for(const [topicId,rows] of Object.entries(material)) {
 if (data.topics.some(t=>t.topicId===topicId)) throw Error('Existing '+topicId);
 const grade=Number(topicId.split('-')[0]),subject=topicId.split('-').slice(1,-1).join('-');
 const items=rows.map((x,i)=>({id:`${topicId}-v4q${i+1}`,text:x[0],correctAnswer:x[1],options:x.slice(1),explanation:`${x[1]} là lựa chọn phù hợp nhất trong tình huống này.`,hint:'Đọc kĩ tình huống và chọn cách an toàn, phù hợp.'}));
 for(const q of items) if(new Set(q.options).size!==4) throw Error('Duplicate '+q.id);
 data.topics.push({topicId,grade,subject,reviewStatus:'pending',items});count+=items.length;
}
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
const qfile='content/alignment-review-queue.json',queue=JSON.parse(fs.readFileSync(qfile,'utf8'));
for(const topicId of Object.keys(material)){const t=queue.items.find(x=>x.topicId===topicId);if(!t)throw Error('No topic '+topicId);t.questionMode='local_bank';t.questionsPerSession=4;t.teacherReview='pending';t.alignmentNote=(t.alignmentNote||'')+' | V4: trắc nghiệm NHẬN BIẾT BỔ TRỢ; không thay thế đánh giá thực hành môn học.';}
fs.writeFileSync(qfile,JSON.stringify(queue,null,2)+'\n');
console.log('Practical V4 new topics',Object.keys(material).length,'questions',count);
