const fs=require('node:fs');
const file='content/extra-practice-bank.json';
const bank=JSON.parse(fs.readFileSync(file,'utf8'));
// Original questions written for supplementary practice; NOT transcribed from SGK.
const collections={
'1-vietnamese-2':[
['Câu nào là câu hỏi?','Em tên là gì?','Em tên là An.','Em đang học.','Em thích đọc sách.','Câu hỏi thường dùng để hỏi và có dấu chấm hỏi.'],
['Trong câu “Bé tưới cây.”, ai tưới cây?','Bé','Cây','Mẹ','Chim','Chủ thể thực hiện việc tưới cây là bé.'],
['Trong câu “Mèo ngủ trên ghế.”, con vật nào được nhắc đến?','Mèo','Chó','Cá','Gà','Từ mèo gọi tên con vật trong câu.'],
['Dấu nào kết thúc câu hỏi?','Dấu chấm hỏi (?)','Dấu chấm (.)','Dấu phẩy (,)','Dấu hai chấm (:)','Câu hỏi thường kết thúc bằng dấu chấm hỏi.'],
['Câu nào nói về hoạt động học tập?','Em đọc sách.','Mưa đang rơi.','Hoa đã nở.','Gió đang thổi.','Đọc sách là hoạt động học tập.']],
'2-vietnamese-1':[
['Trong câu “Bạn Lan chăm sóc cây hoa.”, Lan làm gì?','Chăm sóc cây hoa','Đi xe đạp','Đọc truyện','Đá bóng','Cụm từ chăm sóc cây hoa chỉ việc làm của Lan.'],
['Câu “Sau giờ học, Minh đến thư viện đọc sách.” cho biết Minh đến đâu?','Thư viện','Sân vận động','Nhà bếp','Bến xe','Câu văn nói rõ Minh đến thư viện.'],
['Nhân vật nào được nhắc đến trong câu “Mẹ cùng bé gói quà”?','Mẹ và bé','Ông và bà','Thầy và trò','Bạn và cô','Câu văn nêu mẹ cùng bé gói quà.'],
['Từ nào chỉ cảm xúc vui vẻ?','Hớn hở','Lo lắng','Buồn bã','Sợ hãi','Hớn hở diễn tả niềm vui.'],
['Sau khi đọc truyện, cách nào giúp em hiểu nội dung tốt hơn?','Kể lại những việc chính','Bỏ qua đoạn cuối','Chỉ đếm số chữ','Không đọc tên truyện','Kể lại các sự việc giúp kiểm tra mình đã hiểu câu chuyện.']],
'3-vietnamese-1':[
['Đoạn “Buổi sáng, Nam nhặt rác ở sân trường. Sân trường sạch hơn.” nêu việc gì?','Nam giữ vệ sinh sân trường','Nam trồng hoa ở nhà','Nam đang đá bóng','Nam đi mua sách','Nam nhặt rác khiến sân trường sạch hơn.'],
['Từ nào thể hiện thái độ biết ơn?','Cảm ơn','Im lặng','Tránh mặt','Than phiền','Cảm ơn thể hiện sự trân trọng khi được giúp đỡ.'],
['Một đoạn văn thường gồm gì?','Các câu liên kết về một ý','Các chữ không liên quan','Chỉ một dấu câu','Những phép tính riêng lẻ','Các câu trong đoạn cùng diễn đạt một ý chính.'],
['Trong câu “Gió nhẹ làm lá cây rung rinh”, điều gì khiến lá rung rinh?','Gió nhẹ','Mặt trời','Mưa đá','Đất khô','Câu văn nêu gió nhẹ khiến lá cây rung rinh.'],
['Sau khi đọc bài, câu hỏi nào giúp xác định ý chính?','Bài chủ yếu nói về điều gì?','Bài có bao nhiêu dấu phẩy?','Dòng đầu dài bao nhiêu cm?','Trang sách có màu gì?','Tìm nội dung chủ yếu giúp hiểu ý chính.']],
'4-vietnamese-1':[
['Ý chính của đoạn “Mọi người cùng trồng cây, tưới nước. Con đường làng trở nên xanh mát.” là gì?','Mọi người làm đẹp cảnh quan','Mọi người chuẩn bị đi học','Mọi người sửa đường','Mọi người đi câu cá','Các hành động trồng và chăm cây làm đẹp cảnh quan.'],
['Khi muốn tìm thông tin quan trọng trong một bài đọc, em nên làm gì?','Xác định từ khóa và ý chính','Chỉ nhìn hình minh họa','Bỏ qua tiêu đề','Đọc ngẫu nhiên một câu','Từ khóa và ý chính giúp nắm nội dung văn bản.'],
['Câu nào thể hiện ý kiến cá nhân?','Theo em, đọc sách rất bổ ích.','Hôm nay là thứ ba.','Cây có lá xanh.','Lớp có bảng viết.','Cụm từ theo em báo hiệu người nói đang nêu ý kiến.'],
['Từ “vì” trong câu “Em đi sớm vì trời sắp mưa” gợi quan hệ gì?','Nguyên nhân','So sánh','Liệt kê','Đối lập','Từ vì nêu nguyên nhân của việc đi sớm.'],
['Trong văn bản thông tin, tiêu đề có tác dụng chủ yếu nào?','Gợi nội dung chính','Thay cho toàn bộ nội dung','Làm câu văn dài hơn','Chỉ để trang trí','Tiêu đề giúp người đọc dự đoán nội dung.']],
'5-vietnamese-1':[
['Câu “Bởi trời mưa lớn, trận đấu được hoãn.” nêu quan hệ nào?','Nguyên nhân và kết quả','So sánh hai sự vật','Liệt kê đồ vật','Lựa chọn màu sắc','Mưa lớn là nguyên nhân, hoãn trận đấu là kết quả.'],
['Thông điệp của đoạn “Bạn nhỏ trả lại ví nhặt được cho người mất” gần nhất là gì?','Trung thực trong cuộc sống','Chỉ làm việc khi có thưởng','Không quan tâm người khác','Giữ đồ nhặt được cho mình','Trả lại đồ nhặt được thể hiện tính trung thực.'],
['Khi đọc một bài giới thiệu sự kiện, thông tin nào nên xác định?','Thời gian, địa điểm và sự việc','Chỉ số dòng văn bản','Chỉ số dấu chấm','Chỉ kiểu chữ','Thời gian, địa điểm và sự việc là dữ kiện quan trọng.'],
['Câu nào nêu nhận xét thay vì chỉ kể sự việc?','Buổi biểu diễn thật ấn tượng.','Buổi diễn bắt đầu lúc 8 giờ.','Sân khấu có ba chiếc ghế.','Có bốn tiết mục.','Cụm thật ấn tượng thể hiện đánh giá.'],
['Khi tóm tắt bài đọc, em nên giữ gì?','Các ý chính và mối liên hệ','Mọi từ lặp lại','Chỉ câu cuối cùng','Các chi tiết không liên quan','Bản tóm tắt cần giữ lại những ý chính.']],
'1-english-1':[
['Câu chào buổi sáng trong tiếng Anh là gì?','Good morning','Good night','Goodbye','See you','Good morning là lời chào buổi sáng.'],
['How are you? – Chọn câu trả lời phù hợp.','I am fine, thank you.','My name is a pen.','It is a red.','There are blue.','I am fine, thank you dùng để trả lời hỏi thăm sức khỏe.'],
['Từ nào dùng để chào tạm biệt?','Goodbye','Hello','Hi','Good morning','Goodbye có nghĩa là tạm biệt.'],
['Hello có nghĩa là gì?','Xin chào','Cảm ơn','Xin lỗi','Chúc ngủ ngon','Hello là lời chào.'],
['Tên em là Mai. Chọn câu giới thiệu.','My name is Mai.','I am a cat.','This is red.','Good night.','My name is Mai nghĩa là tên của em là Mai.']],
'2-english-2':[
['What is your name? – Câu trả lời phù hợp là gì?','My name is Nam.','It is blue.','I am eight books.','This is two.','My name is ... dùng để giới thiệu tên.'],
['How old are you? – Chọn câu đúng.','I am seven years old.','I am a school.','My name is yellow.','It is a bag.','How old hỏi tuổi.'],
['Is this your pencil? – Chọn câu trả lời đồng ý.','Yes, it is.','Yes, I do.','It is two.','I am fine.','Với Is this ... có thể trả lời Yes, it is.'],
['What color is it? – It is ...','green','seven','pencil','hello','Green là tên một màu sắc.'],
['Where is the book? – It is on the table. Cuốn sách ở đâu?','Trên bàn','Dưới gầm giường','Trong ba lô','Bên cạnh cửa sổ','On the table nghĩa là ở trên bàn.']],
'3-english-2':[
['This is my _____. (đây là cây bút chì của em)','pencil','teacher','window','chair','Pencil là bút chì.'],
['Where is the ruler? It is ___ the desk. (ở trên bàn)','on','seven','blue','hello','On chỉ vị trí ở trên.'],
['Từ tiếng Anh nào có nghĩa là tẩy?','eraser','window','door','board','Eraser là cục tẩy.'],
['What is this? – It is a _____. (quyển sách)','book','cat','tree','sun','Book là quyển sách.'],
['How many pencils? – Three _____.','pencils','pencil is','blue','hello','Danh từ số nhiều thường thêm s: three pencils.']],
'4-english-2':[
['Where is the library? – It is next to the school. Thư viện ở đâu?','Cạnh trường học','Trong công viên','Sau bưu điện','Trên núi','Next to nghĩa là ở cạnh.'],
['Turn left nghĩa là gì?','Rẽ trái','Rẽ phải','Đi thẳng','Dừng lại','Left là bên trái.'],
['Go straight nghĩa là gì?','Đi thẳng','Quay lại','Rẽ trái','Bước xuống','Go straight là đi thẳng.'],
['Excuse me, where is the ____? (hỏi đường đến bệnh viện)','hospital','happy','yellow','swim','Hospital là bệnh viện.'],
['The park is opposite the bank. Công viên ở đâu?','Đối diện ngân hàng','Bên trong ngân hàng','Phía sau thư viện','Bên dưới lớp học','Opposite nghĩa là đối diện.']],
'5-english-1':[
['What did you do yesterday? – I _____ football.','played','play now','plays','playing now','Yesterday diễn tả quá khứ; played là dạng quá khứ của play.'],
['I ____ my grandparents last Sunday.','visited','visits','visiting','visit tomorrow','Last Sunday là thời gian trong quá khứ; visited phù hợp.'],
['Which word means “hôm qua”?','yesterday','tomorrow','today','always','Yesterday nghĩa là hôm qua.'],
['What do you do every morning? – I _____ my teeth.','brush','brushes','brushed yesterday','brushing now','Với chủ ngữ I ở hiện tại đơn dùng brush.'],
['We went to the zoo. Chúng em đã đi đâu?','Sở thú','Thư viện','Nhà ga','Sân bóng','Zoo nghĩa là sở thú.']],
'1-ethics-2':[
['Khi qua đường, bé nên làm gì?','Đi cùng người lớn và quan sát tín hiệu','Chạy thật nhanh qua đường','Mải nhìn điện thoại','Băng qua chỗ nào cũng được','Trẻ nhỏ nên qua đường ở nơi an toàn và theo hướng dẫn.'],
['Thấy ổ điện hở dây, bé nên làm gì?','Tránh xa và báo người lớn','Chạm tay vào dây','Dùng nước rửa ổ điện','Lấy que chọc vào','Ổ điện hở rất nguy hiểm; báo người lớn xử lý.'],
['Khi có cháy, bé nên làm gì?','Báo người lớn và rời nơi nguy hiểm','Trốn vào tủ','Quay lại lấy đồ chơi','Tự chạm vào lửa','Cần thoát khỏi chỗ nguy hiểm và nhờ người lớn hỗ trợ.'],
['Khi người lạ rủ đi mà bố mẹ chưa đồng ý, bé nên làm gì?','Từ chối và tìm người lớn tin cậy','Đi ngay','Giữ bí mật với bố mẹ','Nhận quà rồi đi','Bé cần bảo vệ an toàn và hỏi người lớn tin cậy.'],
['Khi đi xe máy cùng người lớn, bé nên làm gì?','Đội mũ bảo hiểm phù hợp','Đứng lên trên xe','Bỏ mũ bảo hiểm','Đùa nghịch trên xe','Mũ bảo hiểm giúp bảo vệ đầu.']],
'2-ethics-2':[
['Nội quy yêu cầu xếp hàng khi vào lớp. Em nên làm gì?','Xếp hàng đúng thứ tự','Chen lên trước','Đẩy bạn','Đùa giỡn trong hàng','Xếp hàng thể hiện tôn trọng nội quy.'],
['Khi đến thư viện, em nên làm gì?','Giữ trật tự','Nói thật to','Xé trang sách','Ném sách lên bàn','Giữ trật tự giúp mọi người tập trung đọc.'],
['Nếu đến lớp muộn, em nên làm gì?','Xin phép thầy cô và rút kinh nghiệm','Chạy ồn vào lớp','Đổ lỗi cho bạn','Không vào lớp','Xin phép và tìm cách đúng giờ thể hiện trách nhiệm.'],
['Khi mượn bút của bạn, em nên làm gì?','Xin phép trước và trả lại','Tự lấy không hỏi','Làm hỏng rồi bỏ đi','Giấu bút','Hỏi mượn và trả là tôn trọng tài sản của bạn.'],
['Thấy giấy vụn trên sàn lớp, em nên làm gì?','Nhặt bỏ đúng chỗ','Đá sang lớp khác','Giấu dưới bàn','Bỏ mặc','Giữ vệ sinh lớp là thực hiện nội quy chung.']],
'3-ethics-2':[
['Trong làm việc nhóm, em nên làm gì?','Lắng nghe ý kiến của bạn','Chỉ mình được nói','Chê bai bạn','Bỏ nhóm không báo','Lắng nghe giúp hợp tác hiệu quả.'],
['Thấy bạn gặp khó khăn trong học tập, em nên làm gì?','Hỏi xem có thể giúp gì','Chọc ghẹo bạn','Bỏ đi luôn','Lấy sách của bạn','Quan tâm và giúp đỡ phù hợp là ứng xử tốt.'],
['Khi cùng nhóm có ý kiến khác nhau, em nên làm gì?','Thảo luận lịch sự','La hét','Đánh nhau','Không cho bạn phát biểu','Thảo luận lịch sự giúp tìm tiếng nói chung.'],
['Khi tham gia hoạt động chung, em nên làm gì?','Hoàn thành phần việc được giao','Chỉ chơi một mình','Để người khác làm hết','Về sớm không báo','Hoàn thành phần việc là tinh thần trách nhiệm.'],
['Nhìn thấy bạn mới ở lớp chưa có ai chơi cùng, em nên làm gì?','Chào và mời bạn cùng tham gia','Trêu chọc bạn','Không cho bạn chơi','Nói xấu bạn','Chào đón bạn mới thể hiện sự thân thiện.']],
'4-ethics-2':[
['Khi bạn kể chuyện riêng và nhờ giữ kín, em nên làm gì?','Tôn trọng chuyện riêng tư phù hợp','Đăng lên mạng','Kể ngay với cả lớp','Chế giễu bạn','Tôn trọng đời sống riêng tư là ứng xử văn minh; nếu bạn gặp nguy hiểm cần báo người lớn tin cậy.'],
['Khi bạn có sở thích khác mình, em nên làm gì?','Tôn trọng sở thích của bạn','Chê bạn kỳ lạ','Ép bạn giống mình','Tẩy chay bạn','Mỗi người có sở thích riêng đáng được tôn trọng.'],
['Trong tranh luận, câu nào lịch sự nhất?','Mình có ý kiến khác, chúng ta cùng xem nhé.','Bạn sai hoàn toàn!','Chỉ mình đúng!','Đừng nói nữa!','Nêu ý kiến khác một cách lịch sự giúp trao đổi tích cực.'],
['Khi vô ý làm bạn buồn, em nên làm gì?','Xin lỗi và tìm cách sửa sai','Đổ hết lỗi cho bạn','Tránh mặt mãi','Tiếp tục trêu','Nhận lỗi và sửa sai là cách ứng xử có trách nhiệm.'],
['Khi thấy bạn bị bắt nạt, em nên làm gì?','Tìm người lớn tin cậy để giúp đỡ','Đứng cổ vũ','Quay video để trêu','Tham gia bắt nạt','Cần tìm sự giúp đỡ an toàn để bảo vệ bạn.']],
'5-ethics-2':[
['Nếu chứng kiến hành vi gian lận, em nên làm gì?','Không tham gia và báo thầy cô phù hợp','Làm theo cho giống bạn','Cổ vũ gian lận','Giữ lại để làm sau','Trung thực và tìm người lớn hỗ trợ là cách bảo vệ điều đúng.'],
['Khi có người nói xấu bạn trên mạng, em nên làm gì?','Không chia sẻ và báo người lớn tin cậy','Chia sẻ tiếp','Viết lời xúc phạm','Dọa lại người đó','Không lan truyền nội dung bắt nạt trên mạng.'],
['Khi thấy việc làm gây hại môi trường, em nên làm gì?','Góp ý lịch sự hoặc báo người có trách nhiệm','Làm theo','Giả vờ không thấy','Xả thêm rác','Có thể bảo vệ điều đúng bằng cách góp ý phù hợp.'],
['Khi bất đồng với bạn, cách xử lý nào phù hợp?','Lắng nghe và trao đổi trên tinh thần tôn trọng','Dùng bạo lực','Bêu xấu bạn','Không cho bạn giải thích','Tôn trọng và trao đổi giúp giải quyết bất đồng.'],
['Khi bị yêu cầu chia sẻ mật khẩu, em nên làm gì?','Từ chối và hỏi người lớn tin cậy','Gửi mật khẩu ngay','Đăng công khai','Cho người lạ mượn tài khoản','Mật khẩu là thông tin cần giữ bí mật.']],
'3-it-2':[
['Dữ liệu nào là dạng âm thanh?','Tiếng chim hót','Bức tranh','Chữ viết trên bảng','Hình tam giác','Tiếng chim hót là thông tin dạng âm thanh.'],
['Thông tin nào ở dạng hình ảnh?','Bức ảnh chụp lớp','Lời nói','Tiếng trống','Giai điệu','Bức ảnh cung cấp thông tin bằng hình ảnh.'],
['Muốn biết hôm nay trời mưa hay nắng, nguồn nào trực tiếp quan sát được?','Nhìn bầu trời từ nơi an toàn','Đếm số trang sách','Nghe một bài hát','Xem màu cặp sách','Quan sát bầu trời có thể cho biết dấu hiệu thời tiết.'],
['Khi nhập văn bản vào máy tính, thiết bị nào thường dùng?','Bàn phím','Loa','Màn hình','Máy chiếu','Bàn phím giúp nhập ký tự.'],
['Khi nghe bài học qua máy tính, thiết bị nào phát ra âm thanh?','Loa','Chuột','Bàn phím','Máy quét','Loa phát âm thanh.']],
'4-science-2':[
['Cây xanh cần yếu tố nào để quang hợp?','Ánh sáng','Đồ nhựa','Sỏi màu','Thức ăn nấu chín','Ánh sáng là điều kiện để cây xanh quang hợp.'],
['Rễ cây thường có vai trò nào?','Hút nước và muối khoáng','Tạo âm thanh','Phát sáng','Tạo bóng tối','Rễ giúp cây lấy nước và chất khoáng từ đất.'],
['Yếu tố nào cần thiết cho đa số cây xanh phát triển?','Nước','Khói bụi','Nước bẩn','Nhựa nóng','Nước cần cho các hoạt động sống của cây.'],
['Động vật cần gì để sống?','Nước, thức ăn và không khí phù hợp','Chỉ đồ chơi','Chỉ đá cuội','Chỉ giấy màu','Động vật cần điều kiện sống phù hợp.'],
['Việc nào giúp chăm sóc cây trong lớp?','Tưới nước vừa đủ','Bẻ lá hàng ngày','Nhổ rễ lên xem','Đổ nước xà phòng vào chậu','Tưới nước hợp lí giúp cây sinh trưởng.']],
'5-science-3':[
['Cây có hoa có thể tạo hạt nhờ quá trình nào?','Thụ phấn và thụ tinh','Đóng băng nước','Bào mòn đá','Đốt cháy giấy','Thụ phấn và thụ tinh góp phần hình thành hạt.'],
['Bộ phận nào chứa hạt ở nhiều loại cây có hoa?','Quả','Lá non','Rễ cái','Thân cây','Ở nhiều cây có hoa, hạt nằm trong quả.'],
['Động vật con thường nhận đặc điểm từ đâu?','Bố mẹ của chúng','Viên đá','Giọt nước','Tia sáng','Con non thừa hưởng nhiều đặc điểm từ bố mẹ.'],
['Để giữ vệ sinh phòng bệnh, em nên làm gì?','Rửa tay bằng xà phòng đúng cách','Dùng chung khăn bẩn','Không che miệng khi ho','Ăn thức ăn ôi thiu','Vệ sinh tay giúp giảm nguy cơ lây nhiễm bệnh.'],
['Khi bị sốt kéo dài, em nên làm gì?','Báo người lớn để được chăm sóc y tế','Tự uống thuốc lạ','Đi chơi dưới nắng','Giấu người lớn','Trẻ cần báo người lớn để được chăm sóc phù hợp.']],
'4-history_geo-2':[
['Địa hình nào có độ cao lớn và sườn dốc thường thấy?','Núi','Đồng bằng','Bãi cát','Hồ nước','Núi thường có độ cao lớn hơn vùng đất xung quanh.'],
['Vùng đồng bằng thường thuận lợi với hoạt động nào?','Trồng lúa nước','Nuôi cá biển xa bờ','Khai thác băng tuyết','Leo núi tuyết','Đồng bằng có nhiều điều kiện phù hợp trồng lúa.'],
['Hoạt động nào thể hiện giữ gìn nét đẹp văn hóa vùng miền?','Tìm hiểu và tôn trọng lễ hội truyền thống','Chế giễu trang phục khác','Phá di tích','Vứt rác nơi lễ hội','Tìm hiểu, tôn trọng giúp bảo tồn nét đẹp văn hóa.'],
['Khi tham quan di tích lịch sử, em nên làm gì?','Giữ gìn, không viết vẽ lên di tích','Khắc tên lên tường','Bẻ cây trong khuôn viên','Mang hiện vật đi','Bảo vệ di tích là tôn trọng di sản.'],
['Khí hậu và địa hình ảnh hưởng đến điều gì ở các vùng?','Sinh hoạt và sản xuất của người dân','Bảng chữ cái','Phép cộng','Cách viết số','Điều kiện tự nhiên tác động đến đời sống và sản xuất.']],
'5-history_geo-2':[
['Khi tìm hiểu lịch sử, nguồn nào giúp kiểm chứng thông tin?','Tài liệu lịch sử có nguồn rõ ràng','Lời đồn không kiểm chứng','Trò chơi đoán ngẫu nhiên','Nội dung bịa đặt','Nguồn tin đáng tin cậy giúp đối chiếu sự kiện lịch sử.'],
['Khi đọc mốc “năm 1945”, đây là thông tin về điều gì?','Thời gian','Địa điểm','Kích thước','Màu sắc','Năm là cách ghi thời gian.'],
['Di tích lịch sử có giá trị chủ yếu nào?','Lưu giữ dấu tích quá khứ','Làm biển quảng cáo','Thay thế mọi tài liệu','Chỉ để chơi đùa','Di tích giúp tìm hiểu và gìn giữ lịch sử.'],
['Khi tìm hiểu một nhân vật lịch sử, nên xem điều gì?','Hoàn cảnh và đóng góp của nhân vật','Chỉ tên riêng','Chỉ độ dài tên','Chỉ màu ảnh','Bối cảnh và việc làm giúp hiểu vai trò của nhân vật.'],
['Khi hai tài liệu ghi khác nhau về một sự kiện, em nên làm gì?','Hỏi thầy cô và đối chiếu nguồn đáng tin cậy','Chọn ngẫu nhiên','Tin tin đồn','Bỏ qua mọi tài liệu','Đối chiếu nguồn giúp hiểu lịch sử chính xác hơn.']]
};
let added=0;
for(const [topicId, rows] of Object.entries(collections)) {
  if(bank.topics.some(t=>t.topicId===topicId)) throw Error(`Topic already exists ${topicId}`);
  if(rows.length!==5) throw Error(`Expected 5: ${topicId}`);
  const [grade, subject]=[Number(topicId.split('-')[0]),topicId.split('-').slice(1,-1).join('-')];
  const items=rows.map((row,idx)=>{
    if(row.length!==6 || new Set(row.slice(1,5)).size!==4) throw Error(`Bad item ${topicId} ${idx}`);
    const [text,correctAnswer,...rest]=row;const [d1,d2,d3,explanation]=rest;
    return {id:`${topicId}-v4q${String(idx+1).padStart(2,'0')}`,text,options:[correctAnswer,d1,d2,d3],correctAnswer,explanation,hint:'Em đọc câu hỏi và thử loại trừ các đáp án chưa phù hợp.'};
  });
  bank.topics.push({topicId,grade,subject,reviewStatus:'pending',items});added+=items.length;
}
bank.version='4.0';bank.reviewNote='V4: all V2/V3 and V4 additions remain UNREVIEWED until teacher approves on Firebase.';
fs.writeFileSync(file,JSON.stringify(bank,null,2)+'\n');
const queueFile='content/alignment-review-queue.json';const q=JSON.parse(fs.readFileSync(queueFile,'utf8'));
for (const topicId of Object.keys(collections)) {const t=q.items.find(x=>x.topicId===topicId);if(!t) throw Error(`No curriculum topic ${topicId}`);t.questionMode='local_bank';t.questionsPerSession=5;t.teacherReview='pending';t.alignmentNote=(t.alignmentNote||'')+' | Có bộ câu hỏi bổ trợ V4 tự biên soạn, đang chờ giáo viên đối chiếu từng câu và SGK.';}
q.warning='V4 has supplementary draft banks; no question is automatically verified against individual SGK lessons or teacher-approved.';
fs.writeFileSync(queueFile,JSON.stringify(q,null,2)+'\n');
console.log('V4 new topics',Object.keys(collections).length,'new items',added);
