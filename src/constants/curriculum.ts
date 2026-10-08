/**
 * Khung môn/chủ đề tham chiếu CTGDPT 2018 (TT 32/2018/TT-BGDĐT và các sửa đổi đang hiệu lực).
 * Năm học 2026–2027: bộ sách Kết nối tri thức với cuộc sống (QĐ 3588/QĐ-BGDĐT).
 * Đây là DANH MỤC ĐỊNH HƯỚNG, không phải toàn văn YCCĐ hay mục lục bài SGK.
 * Các câu hỏi AI phải được thẩm định trước khi dùng như ngân hàng câu hỏi chính thức.
 */
import type { Subject } from '../types';

export type Grade = 1 | 2 | 3 | 4 | 5;
export interface CurriculumTopic { id: string; name: string; scope: string; }
export type SubjectAvailability = 'required' | 'optional' | 'unavailable';

export const CURRICULUM_META = {
  academicYear: '2026–2027',
  framework: 'Chương trình giáo dục phổ thông 2018',
  textbook: 'Kết nối tri thức với cuộc sống',
  legalBasis: ['32/2018/TT-BGDĐT', '3588/QĐ-BGDĐT (26/12/2025)'],
  note: 'Khung nội dung minh hoạ; chưa được đối chiếu và thẩm định đến từng bài sách giáo khoa.'
} as const;

const common: Subject[] = ['math', 'vietnamese', 'ethics', 'physical', 'arts', 'experiential'];
export const SUBJECTS_BY_GRADE: Record<Grade, readonly Subject[]> = {
  1: [...common, 'nature', 'english'], // Ngoại ngữ 1 ở lớp 1–2 là môn tự chọn theo khung hiện hành.
  2: [...common, 'nature', 'english'],
  3: [...common, 'nature', 'english', 'it'],
  4: [...common, 'english', 'science', 'history_geo', 'it'],
  5: [...common, 'english', 'science', 'history_geo', 'it']
};

export const getGradeSubjects = (grade: number): Subject[] => [...(SUBJECTS_BY_GRADE[grade as Grade] || [])];
export const getSubjectAvailability = (grade: number, subject: Subject): SubjectAvailability =>
  !getGradeSubjects(grade).includes(subject) ? 'unavailable' :
  subject === 'english' && grade <= 2 ? 'optional' : 'required';

// Topic descriptors are intentionally bounded by grade; they do not claim to be verbatim textbook chapter names.
const topicNames: Record<Subject, Record<Grade, [string, string][]>> = {
  math: {
    1: [['So sánh các số trong phạm vi 20','So sánh số tự nhiên từ 0 đến 20; dấu >, <, =.'],['Cộng, trừ trong phạm vi 10','Phép cộng, phép trừ với kết quả trong phạm vi 10.'],['Hình vuông, tròn, tam giác, chữ nhật','Nhận biết hình phẳng quen thuộc.']],
    2: [['Số trong phạm vi 1000','Đọc, viết, so sánh số trong phạm vi 1000.'],['Cộng, trừ có nhớ','Tính cộng trừ trong phạm vi 1000.'],['Bảng nhân, bảng chia','Bước đầu làm quen phép nhân, phép chia.'],['Đo lường và hình học','Độ dài, khối lượng, thời gian và hình phẳng phù hợp lớp 2.']],
    3: [['Số đến 100 000','Đọc, viết, so sánh các số đến 100 000.'],['Nhân và chia','Nhân, chia số tự nhiên trong phạm vi lớp 3.'],['Phân số qua hình ảnh','Nhận biết phần bằng nhau đơn giản của một đơn vị.'],['Chu vi, diện tích','Tính chu vi và diện tích hình chữ nhật, hình vuông.']],
    4: [['Số tự nhiên và phép tính','Số đến lớp triệu, bốn phép tính với số tự nhiên.'],['Phân số','So sánh và thực hiện phép tính phân số phù hợp lớp 4.'],['Hình học và đo lường','Góc, hai đường thẳng vuông góc/song song, nhận dạng hình bình hành và hình thoi.'],['Dữ liệu và biểu đồ','Đọc và biểu diễn thông tin qua bảng, biểu đồ.']],
    5: [['Số thập phân','Đọc, viết, so sánh và tính toán với số thập phân.'],['Tỉ số phần trăm','Tính tỉ số phần trăm ở các tình huống thực tế.'],['Hình học và thể tích','Diện tích, thể tích của hình hộp chữ nhật, hình lập phương.'],['Chuyển động đều và đo lường','Các bài toán về vận tốc, thời gian, quãng đường phù hợp lớp 5.']]
  },
  vietnamese: {
    1: [['Chữ cái và âm vần','Nhận biết chữ, âm và vần; ghép tiếng, đọc từ.'],['Đọc hiểu câu ngắn','Đọc câu, đoạn đơn giản và hiểu nội dung.'],['Viết câu ngắn','Viết chính tả và câu đơn giản.']],
    2: [['Đọc hiểu văn bản','Đọc hiểu truyện, thơ, văn bản gần gũi.'],['Từ và câu','Mở rộng vốn từ; dấu câu thường gặp.'],['Viết đoạn văn','Viết vài câu kể, tả đơn giản.']],
    3: [['Đọc hiểu và trao đổi','Đọc hiểu văn bản văn học, thông tin ở mức lớp 3.'],['Từ ngữ, dấu câu','Từ chỉ sự vật, hoạt động, đặc điểm; mẫu câu phù hợp.'],['Viết đoạn văn','Viết đoạn kể, tả, nêu cảm nghĩ.']],
    4: [['Đọc hiểu văn bản','Đọc hiểu truyện, thơ, văn bản thông tin phù hợp lớp 4.'],['Ngữ pháp và từ ngữ','Danh từ, động từ, tính từ; cấu tạo và tác dụng câu.'],['Viết bài văn','Lập dàn ý và viết bài văn miêu tả/kể chuyện.']],
    5: [['Đọc hiểu và liên hệ','Đọc hiểu và nhận xét văn bản phù hợp lớp 5.'],['Liên kết câu, đoạn','Vận dụng từ ngữ, dấu câu, liên kết văn bản.'],['Viết bài văn hoàn chỉnh','Viết bài miêu tả, kể chuyện, trình bày ý kiến.']]
  },
  english: {
    1: [['Làm quen chào hỏi','Từ và câu chào hỏi đơn giản; nghe, nói là trọng tâm.'],['Con vật, màu sắc, số','Từ vựng rất cơ bản qua hình ảnh và âm thanh.']],
    2: [['Gia đình, trường lớp','Từ vựng và mẫu câu ngắn theo tình huống quen thuộc.'],['Hỏi đáp đơn giản','Làm quen câu hỏi ngắn, nghe nói với tranh ảnh.']],
    3: [['Giới thiệu bản thân','Chào hỏi, giới thiệu tên, tuổi và người thân.'],['Trường học và đồ vật','Từ vựng và hội thoại đơn giản về lớp học.'],['Sinh hoạt hằng ngày','Nghe, nói, đọc, viết câu cơ bản.']],
    4: [['Sinh hoạt, sở thích','Hỏi đáp về hoạt động, sở thích và thời gian.'],['Địa điểm và chỉ dẫn','Từ vựng, giao tiếp tình huống gần gũi.'],['Đọc viết đoạn ngắn','Đọc hiểu và viết vài câu theo chủ đề.']],
    5: [['Kể về trải nghiệm','Giao tiếp về bản thân, gia đình và hoạt động thường ngày.'],['Thế giới quanh em','Từ vựng về địa điểm, thiên nhiên, sức khỏe.'],['Đọc hiểu, viết thông tin','Đọc viết văn bản ngắn phù hợp cấp tiểu học.']]
  },
  ethics: {
    1: [['Lễ phép và quan tâm','Cách chào hỏi, cảm ơn, xin lỗi và chia sẻ.'],['Giữ an toàn','Nhận biết hành vi an toàn trong cuộc sống.']],
    2: [['Yêu quý gia đình và bạn bè','Hành động quan tâm và giúp đỡ người khác.'],['Tuân thủ nội quy','Tôn trọng nội quy trường lớp.']],
    3: [['Giữ lời hứa','Thực hành trung thực, trách nhiệm.'],['Quan tâm cộng đồng','Hợp tác, chia sẻ trong học tập và sinh hoạt.']],
    4: [['Trách nhiệm cá nhân','Trách nhiệm với việc học, gia đình và cộng đồng.'],['Tôn trọng người khác','Ứng xử đúng mực và đồng cảm.']],
    5: [['Tự chủ và trách nhiệm','Nhận biết và thực hành các hành vi có trách nhiệm.'],['Bảo vệ điều đúng','Tôn trọng quyền lợi, khác biệt và tuân thủ quy định.']]
  },
  nature: {
    1: [['Gia đình và trường học','Nhận biết thành viên và mối quan hệ gần gũi.'],['Cơ thể và sức khoẻ','Các bộ phận cơ thể, vệ sinh, an toàn.'],['Thiên nhiên xung quanh','Nhận biết cây, con vật, thời tiết quen thuộc.']],
    2: [['Môi trường sống','Quan sát cây cối, con vật và nơi sống.'],['Giữ gìn sức khoẻ','Ăn uống, vệ sinh và an toàn.'],['Cộng đồng','Gia đình, trường học, nơi em sống.']],
    3: [['Con người và sức khoẻ','Chăm sóc sức khoẻ bản thân.'],['Thực vật, động vật','Đặc điểm, nhu cầu sống và bảo vệ.'],['Trái Đất và bầu trời','Các hiện tượng tự nhiên gần gũi.']],
    4: [], 5: []
  },
  science: {
    1: [], 2: [], 3: [],
    4: [['Chất và năng lượng','Tính chất của nước, không khí, ánh sáng, âm thanh, nhiệt.'],['Thực vật và động vật','Nhu cầu sống của sinh vật.'],['Con người và sức khỏe','Dinh dưỡng và phòng bệnh phù hợp lớp 4.']],
    5: [['Chất và biến đổi của chất','Một số hỗn hợp, dung dịch, biến đổi phù hợp lớp 5.'],['Năng lượng và môi trường','Sử dụng năng lượng an toàn, tiết kiệm.'],['Sinh vật và sức khoẻ','Sinh sản, phát triển của sinh vật và chăm sóc sức khoẻ.']]
  },
  history_geo: {
    1: [],2: [],3: [],
    4: [['Địa phương em','Vị trí, đặc điểm, văn hoá và lịch sử địa phương.'],['Các vùng miền Việt Nam','Thiên nhiên, dân cư, hoạt động sản xuất, nét văn hoá tiêu biểu.'],['Nhân vật và sự kiện lịch sử','Một số nhân vật và sự kiện tiêu biểu được học ở lớp 4.']],
    5: [['Đất nước và con người Việt Nam','Vị trí, lãnh thổ, dân cư, đặc điểm tự nhiên.'],['Các giai đoạn lịch sử Việt Nam','Nhân vật, sự kiện trong mạch lịch sử lớp 5.'],['Việt Nam và thế giới','Bối cảnh khu vực và thế giới ở mức tiểu học.']]
  },
  it: {
    1: [], 2: [],
    3: [['Làm quen máy tính','Các bộ phận máy tính, thao tác cơ bản, an toàn.'],['Thông tin và xử lí','Nhận biết các dạng thông tin gần gũi.'],['Công nghệ quanh em','Nhận biết sản phẩm công nghệ quen thuộc.']],
    4: [['Soạn thảo và tìm kiếm','Tạo nội dung số đơn giản và tìm thông tin an toàn.'],['An toàn trên mạng','Bảo vệ thông tin cá nhân.'],['Sản phẩm công nghệ','Sử dụng công nghệ hữu ích, phù hợp lứa tuổi.']],
    5: [['Sử dụng phần mềm','Tạo và lưu sản phẩm số cơ bản.'],['An toàn, văn minh số','Ứng xử có trách nhiệm khi sử dụng Internet.'],['Thiết kế và công nghệ','Lắp ghép, mô hình, sản phẩm công nghệ đơn giản.']]
  },
  physical: {
    1: [['Vận động cơ bản','Thực hành động tác vận động đơn giản và an toàn.']],
    2: [['Phối hợp vận động','Luyện tập vận động và chơi đúng luật.']],
    3: [['Thể dục cơ bản','Vận động, phối hợp và an toàn luyện tập.']],
    4: [['Rèn luyện thể lực','Vận động, phối hợp, tinh thần thể thao.']],
    5: [['Kĩ năng vận động','Tập luyện và hình thành thói quen vận động lành mạnh.']]
  },
  arts: {
    1: [['Âm nhạc và Mĩ thuật','Hát, nghe nhạc, cảm nhận màu sắc và hình ảnh.']],
    2: [['Âm nhạc và Mĩ thuật','Hát, tiết tấu, tạo hình và cảm thụ nghệ thuật.']],
    3: [['Âm nhạc và Mĩ thuật','Biểu diễn, vẽ và tạo sản phẩm nghệ thuật.']],
    4: [['Âm nhạc và Mĩ thuật','Thể hiện sáng tạo với âm thanh và hình ảnh.']],
    5: [['Âm nhạc và Mĩ thuật','Cảm thụ và thực hành nghệ thuật phù hợp cấp học.']]
  },
  experiential: {
    1: [['Bản thân và trường lớp','Tự phục vụ, hợp tác và khám phá môi trường học đường.']],
    2: [['Bản thân, gia đình, cộng đồng','Làm việc nhóm và tự chăm sóc bản thân.']],
    3: [['Học tập và trải nghiệm','Hợp tác, giải quyết việc thường ngày.']],
    4: [['Phát triển bản thân','Kĩ năng tổ chức, ứng xử và hoạt động cộng đồng.']],
    5: [['Trách nhiệm và định hướng','Thực hành hợp tác, tự phục vụ và tham gia cộng đồng.']]
  }
};

export function getTopics(grade: number, subject: Subject): CurriculumTopic[] {
  if (getSubjectAvailability(grade, subject) === 'unavailable') return [];
  const arr = topicNames[subject]?.[grade as Grade] || [];
  return arr.map(([name, scope], i) => ({ id: `${grade}-${subject}-${i + 1}`, name, scope }));
}

export function getTopic(grade: number, subject: Subject, topicId?: string): CurriculumTopic | undefined {
  const topics = getTopics(grade, subject);
  return topics.find(topic => topic.id === topicId) || topics[0];
}
