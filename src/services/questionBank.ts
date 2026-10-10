/**
 * Ngân hàng bài luyện BẢN THỬ NGHIỆM – tự biên soạn, KHÔNG sao chép SGK.
 * Phạm vi tham chiếu: CTGDPT 2018; bộ sách Kết nối tri thức với cuộc sống
 * được lựa chọn cho năm học 2026–2027 theo QĐ 3588/QĐ-BGDĐT.
 * Chưa có đối chiếu số bài/trang trong SGK hoặc thẩm định bởi giáo viên.
 * Phép toán có thể được kiểm tra tự động; câu hỏi ngôn ngữ cần giáo viên duyệt.
 */
import type { Question, Subject } from '../types';
import { getTopic, getSubjectAvailability } from '../constants/curriculum';
import extraPractice from '../../content/extra-practice-bank.json';

type Grade = 1 | 2 | 3 | 4 | 5;
type Difficulty = 'easy' | 'medium' | 'hard';
type BankItem = [question: string, choices: string[], answer: string, explanation: string];
const r = (low: number, high: number) => low + Math.floor(Math.random() * (high - low + 1));
const choose = <T,>(arr: T[]): T => arr[r(0, arr.length - 1)];
const shuffle = <T,>(a: T[]): T[] => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = r(0, i);
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};
const fraction = (a: number, b: number) => `${a}/${b}`;
function makeQuestion(text: string, correct: string, options: string[], explanation: string, hint: string, id: string, topic: string): Question {
  const dedup = [...new Set([correct, ...options])];
  if (dedup.length < 3) throw new Error(`Ngân hàng chưa đủ đáp án phân biệt: ${id}`);
  return { id, text, options: shuffle(dedup.slice(0, 4)), correctAnswer: correct, explanation, hint, topic };
}
function numericQuestion(text: string, value: number, id: string, topic: string, explain: string, step = 1, hint = 'Em tính cẩn thận từng bước nhé!', decimals = 0): Question {
  const format = (n: number) => decimals ? n.toFixed(decimals).replace('.', ',') : String(n);
  const correct = format(value);
  const values = new Set([correct]);
  for (const delta of [step, -step, step * 2, -step * 2, step * 3, -step * 3, step * 4, -step * 4]) {
    const other = value + delta;
    if (other >= 0) values.add(format(other));
    if (values.size >= 4) break;
  }
  return makeQuestion(text, correct, [...values].slice(1), explain, hint, id, topic);
}
function compareQuestion(a: number, b: number, id: string, topic: string): Question {
  const answer = a === b ? '=' : a > b ? '>' : '<';
  return makeQuestion(`Điền dấu thích hợp: ${a} ? ${b}`, answer, ['>', '<', '='], `${a} ${answer} ${b} vì ${a === b ? 'hai số bằng nhau' : a > b ? `${a} lớn hơn ${b}` : `${a} bé hơn ${b}`}.`, 'Dấu có phía rộng mở về số lớn.', id, topic);
}
function lessonMath(grade: Grade, topicIndex: number, idx: number, difficulty: Difficulty, topic: string): Question {
  const level = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2;
  const id = `soan-${grade}-math-${topicIndex}-${idx}-${r(1, 999999)}`;
  const num = (text: string, ans: number, explanation: string, step = 1, hint?: string, decimals?: number) =>
    numericQuestion(text, ans, id, topic, explanation, step, hint, decimals);
  const word = (text: string, answer: string, distractors: string[], explanation: string, hint = 'Em nhớ lại đặc điểm của hình hoặc kiến thức đã học nhé!') =>
    makeQuestion(text, answer, distractors, explanation, hint, id, topic);
  switch (`${grade}-${topicIndex}`) {
    case '1-0': {
      const max = level === 0 ? 10 : 20;
      const lo = r(0, max - 1), hi = r(lo + 1, max);
      const a = idx % 3 === 0 ? lo : idx % 3 === 1 ? hi : lo;
      const b = idx % 3 === 0 ? lo : idx % 3 === 1 ? lo : hi;
      return compareQuestion(a, b, id, topic);
    }
    case '1-1': {
      const a = r(0, 5 + level * 2), b = r(0, 10 - a);
      if (idx % 2 === 0) return num(`${a} + ${b} = ?`, a + b, `${a} cộng ${b} bằng ${a + b}.`);
      return num(`${a + b} - ${a} = ?`, b, `Lấy ${a + b} trừ ${a} còn ${b}.`);
    }
    case '1-2': {
      const shapes = [
        ['Hình nào có 3 cạnh?', 'Hình tam giác', ['Hình vuông', 'Hình tròn', 'Hình chữ nhật']],
        ['Hình nào không có cạnh thẳng?', 'Hình tròn', ['Hình tam giác', 'Hình vuông', 'Hình chữ nhật']],
        ['Hình nào có 4 cạnh bằng nhau và 4 góc vuông?', 'Hình vuông', ['Hình tam giác', 'Hình tròn', 'Hình chữ nhật']],
        ['Trong các hình sau, hình nào có 4 góc vuông?', 'Hình chữ nhật', ['Hình tròn', 'Hình tam giác', 'Đường cong']],
        ['Hình tam giác có mấy cạnh?', '3 cạnh', ['4 cạnh', '2 cạnh', '5 cạnh']],
        ['Hình vuông có mấy cạnh?', '4 cạnh', ['2 cạnh', '3 cạnh', '5 cạnh']],
        ['Hình chữ nhật có mấy đỉnh?', '4 đỉnh', ['2 đỉnh', '3 đỉnh', '5 đỉnh']],
        ['Hình tròn có mấy góc?', 'Không có góc', ['1 góc', '3 góc', '4 góc']],
        ['Hình nào có 3 đỉnh?', 'Hình tam giác', ['Hình vuông', 'Hình chữ nhật', 'Hình tròn']],
        ['Hình vuông có mấy góc vuông?', '4 góc vuông', ['2 góc vuông', '3 góc vuông', 'Không có góc vuông']]
      ] as const;
      const [question, answer, others] = shapes[idx % shapes.length];
      return word(question, answer, [...others], `Đáp án đúng là ${answer.toLowerCase()}.`);
    }
    case '2-0': {
      const a = r(level ? 100 : 10, level === 2 ? 999 : 500), b = idx % 4 === 0 ? a : r(0, 999);
      return compareQuestion(a, b, id, topic);
    }
    case '2-1': {
      const a = r(40, level === 2 ? 650 : 250), b = r(20, level === 0 ? 100 : 300);
      return idx % 2 === 0 ? num(`${a} + ${b} = ?`, a + b, `Cộng hai số ta được ${a + b}.`) : num(`${a + b} - ${b} = ?`, a, `Lấy tổng ${a + b} trừ ${b} còn ${a}.`);
    }
    case '2-2': {
      const x = choose([2, 5]), y = r(2, 10);
      return idx % 2 === 0 ? num(`${x} × ${y} = ?`, x * y, `${x} nhân ${y} bằng ${x * y}.`) : num(`${x * y} : ${x} = ?`, y, `${x * y} chia ${x} bằng ${y}.`);
    }
    case '2-3': {
      if (idx % 2 === 0) { const dm = r(1, 9); return num(`${dm} dm bằng bao nhiêu cm?`, dm * 10, `1 dm = 10 cm nên ${dm} dm = ${dm * 10} cm.`, 10); }
      const h = r(1, 10); return num(`Bây giờ là ${h} giờ. Sau ${h} giờ nữa là mấy giờ (theo cách tính 24 giờ)?`, h + h, `Sau ${h} giờ nữa, đồng hồ chỉ ${h + h} giờ.`);
    }
    case '3-0': { const a = r(1_000, 99_999), b = idx % 4 === 0 ? a : r(1_000, 99_999); return compareQuestion(a, b, id, topic); }
    case '3-1': {
      const x = r(2, 9), y = r(3, level === 2 ? 40 : 15);
      return idx % 2 === 0 ? num(`${y} × ${x} = ?`, x * y, `${y} nhân ${x} được ${x * y}.`) : num(`${x * y} : ${x} = ?`, y, `${x * y} chia ${x} được ${y}.`);
    }
    case '3-2': {
      const n = 2 + idx % 8, part = 1;
      return word(`Một hình chia thành ${n} phần bằng nhau, tô màu ${part} phần. Đã tô màu một phần mấy của hình?`, fraction(part, n),
        [fraction(n, part), fraction(n - part, n), fraction(part, n + 1), fraction(part + 1, n)],
        `Tô màu ${part} trong ${n} phần bằng nhau nên viết là ${fraction(part, n)}.`, 'Tử số chỉ phần đã tô, mẫu số chỉ tổng số phần bằng nhau.');
    }
    case '3-3': {
      const b = r(2, 11), a = r(b + 1, 12);
      return idx % 2 === 0 ? num(`Hình chữ nhật dài ${a} cm, rộng ${b} cm. Chu vi là bao nhiêu cm?`, 2 * (a + b), `Chu vi = (${a} + ${b}) × 2 = ${2 * (a + b)} cm.`, 2) :
        num(`Hình chữ nhật dài ${a} cm, rộng ${b} cm. Diện tích là bao nhiêu cm²?`, a * b, `Diện tích = ${a} × ${b} = ${a * b} cm².`);
    }
    case '4-0': {
      const a = r(10_000, level === 2 ? 9_000_000 : 900_000), b = r(1_000, 50_000);
      return idx % 2 === 0 ? num(`${a} + ${b} = ?`, a + b, `Cộng theo từng hàng được ${a + b}.`, 100) : num(`${a + b} - ${b} = ?`, a, `Lấy ${a + b} trừ ${b} được ${a}.`, 100);
    }
    case '4-1': {
      const den = choose([2, 3, 4, 5, 6, 8, 10]), a = r(1, den - 1), b = r(1, den - 1);
      const answer = fraction(a + b, den);
      return word(`Tính ${fraction(a, den)} + ${fraction(b, den)} = ?`, answer,
        [fraction(a + b, den + den), fraction(a * b, den), fraction(a + b + 1, den), fraction(Math.max(1, a + b - 1), den)],
        `Hai phân số cùng mẫu: cộng tử số ${a} + ${b} = ${a + b}, giữ mẫu ${den}.`, 'Hai mẫu số giống nhau thì giữ nguyên mẫu.');
    }
    case '4-2': {
      // CTGDPT môn Toán lớp 4 yêu cầu nhận dạng hình bình hành, hình thoi,
      // góc và các quan hệ song song/vuông góc; KHÔNG gán công thức diện tích
      // hình bình hành/hình thoi vào chuẩn bắt buộc của lớp 4.
      const items: [string, string, string[], string][] = [
        ['Hình nào có hai cặp cạnh đối song song?', 'Hình bình hành', ['Hình tam giác', 'Hình tròn', 'Đoạn thẳng'], 'Hình bình hành có hai cặp cạnh đối song song.'],
        ['Hình nào có bốn cạnh bằng nhau?', 'Hình thoi', ['Hình tam giác thường', 'Hình thang thường', 'Hình tròn'], 'Hình thoi có bốn cạnh bằng nhau.'],
        ['Hai đường thẳng tạo với nhau một góc vuông gọi là hai đường thẳng thế nào?', 'Vuông góc', ['Song song', 'Trùng nhau', 'Không cắt nhau'], 'Hai đường thẳng vuông góc tạo thành góc 90 độ.'],
        ['Hai đường thẳng cùng nằm trên một mặt phẳng và không cắt nhau được gọi là gì?', 'Song song', ['Vuông góc', 'Cắt nhau', 'Trùng nhau'], 'Hai đường thẳng song song không có điểm chung.'],
        ['Góc lớn hơn góc vuông nhưng nhỏ hơn góc bẹt gọi là góc gì?', 'Góc tù', ['Góc nhọn', 'Góc vuông', 'Góc bẹt'], 'Góc tù lớn hơn 90 độ nhưng nhỏ hơn 180 độ.'],
        ['Góc nhỏ hơn góc vuông gọi là góc gì?', 'Góc nhọn', ['Góc bẹt', 'Góc vuông', 'Góc tù'], 'Góc nhọn nhỏ hơn 90 độ.'],
        ['Góc có số đo bằng 180 độ gọi là góc gì?', 'Góc bẹt', ['Góc vuông', 'Góc nhọn', 'Góc tù'], 'Góc bẹt có số đo 180 độ.'],
        ['Hình nào thường được nhận biết qua hai cặp cạnh đối song song?', 'Hình bình hành', ['Hình tam giác', 'Hình tròn', 'Hình ngũ giác'], 'Tứ giác có hai cặp cạnh đối song song là hình bình hành.'],
        ['Dụng cụ nào thường dùng để kiểm tra hoặc vẽ góc vuông?', 'Ê-ke', ['Com-pa', 'Đồng hồ', 'Nhiệt kế'], 'Ê-ke có góc vuông, giúp kiểm tra và vẽ góc vuông.'],
        ['Góc vuông có số đo bằng bao nhiêu độ?', '90 độ', ['45 độ', '120 độ', '180 độ'], 'Góc vuông có số đo là 90 độ.']
      ];
      const [text, answer, others, explanation] = items[idx % items.length];
      return word(text, answer, others, explanation);
    }
    case '4-3': {
      const first = r(2, 9), second = r(2, 9);
      return idx % 2 === 0 ? num(`Khảo sát hai nhóm: ${first} bạn chỉ thích bóng đá, ${second} bạn chỉ thích cầu lông. Hai nhóm có tất cả bao nhiêu bạn?`, first + second, `Cộng hai nhóm: ${first} + ${second} = ${first + second}.`) :
        num(`Bảng số liệu: Thứ hai đọc ${first} trang, thứ ba đọc ${second} trang. Hai ngày đọc bao nhiêu trang?`, first + second, `Cộng số trang hai ngày: ${first} + ${second} = ${first + second}.`);
    }
    case '5-0': {
      const a = r(12, 399) / 10, b = r(1, 99) / 10;
      const answer = Math.round((idx % 2 === 0 ? a + b : a - b) * 10) / 10;
      if (answer < 0) return num(`${a.toFixed(1).replace('.', ',')} + ${b.toFixed(1).replace('.', ',')} = ?`, a + b, `Cộng các hàng thập phân được ${(a + b).toFixed(1).replace('.', ',')}.`, .1, 'Đặt thẳng hàng dấu phẩy.', 1);
      const symbol = idx % 2 === 0 ? '+' : '-';
      return num(`${a.toFixed(1).replace('.', ',')} ${symbol} ${b.toFixed(1).replace('.', ',')} = ?`, answer, `Tính theo hàng phần mười được ${answer.toFixed(1).replace('.', ',')}.`, .1, 'Đặt thẳng hàng dấu phẩy.', 1);
    }
    case '5-1': {
      const base = r(2, 20) * 100, pct = choose([10, 20, 25, 50]);
      return num(`${pct}% của ${base} là bao nhiêu?`, base * pct / 100, `${pct}% của ${base} = ${base} × ${pct} : 100 = ${base * pct / 100}.`, 10, 'Đổi phần trăm sang phân số có mẫu 100.');
    }
    case '5-2': {
      const b = r(2, 8), a = r(b + 1, 9), c = r(2, 7);
      return idx % 2 === 0 ? num(`Hình hộp chữ nhật có chiều dài ${a} cm, rộng ${b} cm, cao ${c} cm. Thể tích là bao nhiêu cm³?`, a * b * c, `Thể tích = ${a} × ${b} × ${c} = ${a * b * c} cm³.`) :
        num(`Hình lập phương cạnh ${a} cm có thể tích bao nhiêu cm³?`, a ** 3, `Thể tích = ${a} × ${a} × ${a} = ${a ** 3} cm³.`);
    }
    case '5-3': {
      const speed = r(3, 24), time = r(2, 5);
      return idx % 2 === 0 ? num(`Một xe đi đều ${speed} km mỗi giờ trong ${time} giờ. Xe đi được bao nhiêu km?`, speed * time, `Quãng đường = vận tốc × thời gian = ${speed} × ${time} = ${speed * time} km.`) :
        num(`Một bạn đi ${speed * time} km trong ${time} giờ với vận tốc không đổi. Vận tốc là bao nhiêu km/giờ?`, speed, `Vận tốc = quãng đường : thời gian = ${speed * time} : ${time} = ${speed} km/giờ.`);
    }
  }
  throw new Error(`Chưa có bài Toán lớp ${grade}, chủ đề ${topicIndex}`);
}

// Mỗi hàng: câu hỏi, danh sách đáp án, đáp án đúng, lời giải ngắn.
// Những câu này là ví dụ mới soạn theo kĩ năng phổ quát, KHÔNG gắn số trang SGK.
const LANGUAGE_BANK: Partial<Record<Subject, Partial<Record<Grade, BankItem[]>>>> = {
  vietnamese: {
    1: [
      ['Chữ nào là chữ “a”?', ['a','o','e','u'], 'a','Chữ a được viết là “a”.'],
      ['Chữ nào có dấu sắc?', ['bé','bè','bẻ','bẹ'], 'bé', 'Từ “bé” có dấu sắc trên chữ e.'],
      ['Từ nào chỉ con vật?', ['mèo','bàn','ghế','bút'], 'mèo', 'Mèo là con vật.'],
      ['Chữ in hoa của “m” là gì?', ['M','N','H','K'], 'M', 'Chữ m viết hoa là M.'],
      ['Từ nào có vần “an”?', ['bàn','bút','bò','bé'], 'bàn', 'Từ “bàn” có vần an và dấu huyền.'],
      ['Chữ nào có dấu huyền?', ['bà','bá','bả','bạ'], 'bà', 'Từ “bà” có dấu huyền.'],
      ['Chữ nào là chữ “đ”?', ['đ','d','b','p'], 'đ', 'Chữ đ có nét ngang qua thân chữ.'],
      ['Từ nào bắt đầu bằng chữ “c”?', ['cá','gà','mẹ','bé'], 'cá', 'Từ cá bắt đầu bằng chữ c.'],
      ['Chữ in hoa của “b” là gì?', ['B','D','P','R'], 'B', 'Chữ b viết hoa là B.'],
      ['Từ nào có dấu nặng?', ['mẹ','mè','mẻ','mé'], 'mẹ', 'Chữ ẹ trong từ mẹ mang dấu nặng.']
    ],
    2: [
      ['Câu nào kết thúc bằng dấu hỏi?', ['Bạn tên là gì?','Em đang đọc sách.','Ôi, đẹp quá!','Em thích vẽ.'], 'Bạn tên là gì?', 'Câu hỏi thường kết thúc bằng dấu chấm hỏi.'],
      ['Từ nào chỉ hoạt động?', ['chạy','đỏ','cao','xanh'], 'chạy', 'Chạy là một hoạt động.'],
      ['Từ nào chỉ đặc điểm?', ['dịu dàng','học sinh','cái cặp','sân trường'], 'dịu dàng', 'Dịu dàng là từ chỉ đặc điểm.'],
      ['Từ nào chỉ sự vật?', ['cái bàn','hát','đẹp','nhanh'], 'cái bàn', 'Cái bàn là một sự vật.'],
      ['Điền từ: “Em ... sách trong thư viện.”', ['đọc','bay','nở','chảy'], 'đọc', 'Em đọc sách trong thư viện.'],
      ['Câu nào là lời chào lịch sự?', ['Cháu chào cô ạ!','Tránh ra!','Này!','Nhanh lên!'], 'Cháu chào cô ạ!', 'Lời chào có từ ngữ phù hợp và lễ phép.'],
      ['Câu nào có dấu chấm đúng?', ['Em đi học.','Em đi học?','Em đi học,','Em đi học;'], 'Em đi học.', 'Câu kể đơn giản thường kết thúc bằng dấu chấm.'],
      ['Từ trái nghĩa với “cao” là từ nào?', ['thấp','dài','rộng','to'], 'thấp', 'Cao và thấp là hai từ trái nghĩa.']
    ],
    3: [
      ['Từ nào chỉ hoạt động?', ['nhảy dây','xinh đẹp','màu xanh','quyển vở'], 'nhảy dây', 'Nhảy dây là một hoạt động.'],
      ['Từ nào chỉ đặc điểm?', ['chăm chỉ','học bài','cây bàng','chiếc cặp'], 'chăm chỉ', 'Chăm chỉ diễn tả đặc điểm.'],
      ['Câu nào dùng dấu hỏi đúng?', ['Bạn có khỏe không?','Bạn có khỏe không.','Bạn có khỏe không!','Bạn có khỏe không,'], 'Bạn có khỏe không?', 'Câu nghi vấn dùng dấu hỏi.'],
      ['Từ nào gần nghĩa với “siêng năng”?', ['chăm chỉ','lười biếng','bừa bộn','ồn ào'], 'chăm chỉ', 'Siêng năng gần nghĩa với chăm chỉ.'],
      ['Từ nào trái nghĩa với “vui vẻ”?', ['buồn bã','hồ hởi','phấn khởi','hân hoan'], 'buồn bã', 'Vui vẻ trái nghĩa với buồn bã.'],
      ['Trong câu “Chim hót líu lo.” từ nào chỉ hoạt động?', ['hót','chim','líu lo','không có'], 'hót', 'Hót là hoạt động của chim.'],
      ['Trong câu “Bầu trời trong xanh.” từ nào chỉ đặc điểm?', ['trong xanh','bầu trời','trời','bầu'], 'trong xanh', 'Trong xanh chỉ đặc điểm của bầu trời.'],
      ['Câu “Bạn Hoa đang đọc sách.” nói về ai?', ['Bạn Hoa','cuốn sách','thư viện','giáo viên'], 'Bạn Hoa', 'Câu nói về hoạt động của bạn Hoa.']
    ],
    4: [
      ['Từ nào là danh từ?', ['học sinh','chạy','đẹp','nhanh'], 'học sinh', 'Học sinh là danh từ chỉ người.'],
      ['Từ nào là động từ?', ['viết','đẹp','cao','đỏ'], 'viết', 'Viết là động từ chỉ hoạt động.'],
      ['Từ nào là tính từ?', ['hiền lành','đi bộ','đọc sách','cái bàn'], 'hiền lành', 'Hiền lành là tính từ chỉ tính chất.'],
      ['Chủ ngữ trong câu “Những chú chim đang hót.” là gì?', ['Những chú chim','đang hót','hót','chú'], 'Những chú chim', 'Chủ ngữ nêu đối tượng được nói đến.'],
      ['Vị ngữ trong câu “Mẹ nấu cơm.” là gì?', ['nấu cơm','Mẹ','cơm','nấu'], 'nấu cơm', 'Vị ngữ nói lên hoạt động của mẹ.'],
      ['Từ nào gần nghĩa với “dũng cảm”?', ['gan dạ','rụt rè','lo lắng','sợ hãi'], 'gan dạ', 'Gan dạ gần nghĩa với dũng cảm.'],
      ['Dấu câu nào dùng để kết thúc câu hỏi?', ['?','.',',',';'], '?', 'Câu hỏi dùng dấu chấm hỏi.'],
      ['Trong câu “Cây phượng đỏ rực.” từ nào là tính từ?', ['đỏ rực','cây phượng','cây','phượng'], 'đỏ rực', 'Đỏ rực chỉ đặc điểm màu sắc.']
    ],
    5: [
      ['Từ nào là quan hệ từ?', ['và','chạy','màu xanh','quyển sách'], 'và', 'Và nối các từ hoặc vế câu.'],
      ['Cặp từ nào thể hiện nguyên nhân – kết quả?', ['vì ... nên','tuy ... nhưng','nếu ... thì','càng ... càng'], 'vì ... nên', 'Vì ... nên liên kết nguyên nhân và kết quả.'],
      ['Từ nào gần nghĩa với “trung thực”?', ['thật thà','gian dối','hời hợt','lơ đãng'], 'thật thà', 'Trung thực gần nghĩa với thật thà.'],
      ['Từ nào trái nghĩa với “đoàn kết”?', ['chia rẽ','gắn bó','đồng lòng','hợp tác'], 'chia rẽ', 'Đoàn kết trái nghĩa với chia rẽ.'],
      ['Câu “Vì trời mưa nên em mang áo mưa.” cho biết quan hệ gì?', ['Nguyên nhân – kết quả','Tương phản','So sánh','Liệt kê'], 'Nguyên nhân – kết quả', 'Trời mưa là nguyên nhân, mang áo mưa là kết quả.'],
      ['Từ “chúng em” trong câu “Chúng em cùng trồng cây.” là gì?', ['Đại từ','Động từ','Tính từ','Số từ'], 'Đại từ', 'Chúng em dùng để xưng hô, là đại từ.'],
      ['Cặp từ nào thể hiện sự tương phản?', ['tuy ... nhưng','vì ... nên','nếu ... thì','càng ... càng'], 'tuy ... nhưng', 'Tuy ... nhưng thể hiện sự tương phản.'],
      ['Từ nào chỉ một phẩm chất tốt?', ['nhân ái','ích kỉ','lười biếng','gian dối'], 'nhân ái', 'Nhân ái là phẩm chất biết yêu thương người khác.']
    ]
  },
  english: {
    1: [
      ['“Cat” nghĩa là gì?', ['Con mèo','Con chó','Con cá','Con gà'], 'Con mèo', 'Cat nghĩa là con mèo.'],
      ['“Dog” nghĩa là gì?', ['Con chó','Con chim','Con bò','Con mèo'], 'Con chó', 'Dog nghĩa là con chó.'],
      ['“Red” là màu gì?', ['Đỏ','Xanh lá','Vàng','Đen'], 'Đỏ', 'Red nghĩa là màu đỏ.'],
      ['“Blue” là màu gì?', ['Xanh dương','Đỏ','Trắng','Vàng'], 'Xanh dương', 'Blue nghĩa là màu xanh dương.'],
      ['“One” là số mấy?', ['1','2','3','4'], '1', 'One nghĩa là số 1.'],
      ['“Green” là màu gì?', ['Xanh lá','Đỏ','Trắng','Vàng'], 'Xanh lá', 'Green nghĩa là màu xanh lá.'],
      ['“Two” là số mấy?', ['2','1','4','3'], '2', 'Two nghĩa là số 2.'],
      ['“Yellow” là màu gì?', ['Vàng','Đỏ','Tím','Đen'], 'Vàng', 'Yellow nghĩa là màu vàng.']
    ],
    2: [
      ['“Mother” là ai?', ['Mẹ','Bố','Anh trai','Em gái'], 'Mẹ', 'Mother nghĩa là mẹ.'],
      ['“Father” là ai?', ['Bố','Mẹ','Bà','Em bé'], 'Bố', 'Father nghĩa là bố.'],
      ['“School” nghĩa là gì?', ['Trường học','Bệnh viện','Chợ','Công viên'], 'Trường học', 'School nghĩa là trường học.'],
      ['“Book” nghĩa là gì?', ['Quyển sách','Cái bàn','Cái ghế','Cửa sổ'], 'Quyển sách', 'Book nghĩa là quyển sách.'],
      ['“How are you?” hỏi về điều gì?', ['Tình trạng của bạn','Tên của bạn','Tuổi của bạn','Nơi ở của bạn'], 'Tình trạng của bạn', 'How are you? hỏi thăm tình trạng.'],
      ['“Pencil” là đồ vật nào?', ['Bút chì','Thước kẻ','Cục tẩy','Quyển vở'], 'Bút chì', 'Pencil nghĩa là bút chì.'],
      ['“Thank you” dùng khi nào?', ['Khi cảm ơn','Khi chào tạm biệt','Khi hỏi tên','Khi xin lỗi'], 'Khi cảm ơn', 'Thank you có nghĩa là cảm ơn.'],
      ['“Goodbye!” có nghĩa là gì?', ['Tạm biệt','Xin chào','Cảm ơn','Xin lỗi'], 'Tạm biệt', 'Goodbye dùng khi tạm biệt.']
    ],
    3: [
      ['Điền từ: “My ... is Nam.”', ['name','old','are','years'], 'name', 'My name is Nam nghĩa là tên tôi là Nam.'],
      ['“I am eight years old.” nói điều gì?', ['Tôi 8 tuổi','Tôi 8 giờ','Tôi có 8 sách','Tôi ở lớp 8'], 'Tôi 8 tuổi', 'Years old dùng để nói tuổi.'],
      ['“Ruler” là đồ dùng gì?', ['Thước kẻ','Bút chì','Cặp sách','Bàn học'], 'Thước kẻ', 'Ruler là thước kẻ.'],
      ['“Teacher” nghĩa là gì?', ['Giáo viên','Học sinh','Bác sĩ','Bạn bè'], 'Giáo viên', 'Teacher là giáo viên.'],
      ['Điền từ: “This is ... book.”', ['my','am','is','are'], 'my', 'My book có nghĩa là quyển sách của tôi.'],
      ['“What is your name?” hỏi gì?', ['Tên của bạn','Tuổi của bạn','Nghề của bạn','Màu bạn thích'], 'Tên của bạn', 'Câu hỏi dùng để hỏi tên.'],
      ['“Library” là nơi nào?', ['Thư viện','Sân vận động','Nhà bếp','Bệnh viện'], 'Thư viện', 'Library nghĩa là thư viện.'],
      ['“Open your book.” yêu cầu làm gì?', ['Mở sách','Đóng sách','Đứng lên','Ngồi xuống'], 'Mở sách', 'Open your book nghĩa là mở sách.']
    ],
    4: [
      ['“I like swimming.” có nghĩa là gì?', ['Tôi thích bơi','Tôi thích hát','Tôi thích chạy','Tôi thích đọc'], 'Tôi thích bơi', 'Swimming là bơi lội.'],
      ['“Monday” là thứ mấy?', ['Thứ hai','Thứ ba','Thứ tư','Chủ nhật'], 'Thứ hai', 'Monday là thứ hai.'],
      ['“Hospital” là nơi nào?', ['Bệnh viện','Trường học','Siêu thị','Bưu điện'], 'Bệnh viện', 'Hospital là bệnh viện.'],
      ['Điền từ ở thì hiện tại đơn: “She ... football every Sunday.”', ['plays','play','playing','played'], 'plays', 'Chủ ngữ she dùng động từ plays ở hiện tại đơn.'],
      ['“Where is the library?” hỏi gì?', ['Thư viện ở đâu','Mấy giờ rồi','Bạn tên gì','Bạn khỏe không'], 'Thư viện ở đâu', 'Where dùng để hỏi nơi chốn.'],
      ['“I go to school at seven.” nói điều gì?', ['Tôi đi học lúc 7 giờ','Tôi ngủ lúc 7 giờ','Tôi ăn lúc 7 giờ','Tôi chơi lúc 7 giờ'], 'Tôi đi học lúc 7 giờ', 'At seven là lúc bảy giờ.'],
      ['“Sunday” là ngày nào?', ['Chủ nhật','Thứ sáu','Thứ hai','Thứ bảy'], 'Chủ nhật', 'Sunday là chủ nhật.'],
      ['“Turn left” có nghĩa là gì?', ['Rẽ trái','Rẽ phải','Đi thẳng','Dừng lại'], 'Rẽ trái', 'Turn left nghĩa là rẽ trái.']
    ],
    5: [
      ['“I went to the zoo yesterday.” có nghĩa là gì?', ['Hôm qua tôi đến sở thú','Hôm nay tôi đến sở thú','Ngày mai tôi đến sở thú','Tôi đang ở sở thú'], 'Hôm qua tôi đến sở thú', 'Went ... yesterday chỉ việc đã xảy ra hôm qua.'],
      ['“Environment” có nghĩa là gì?', ['Môi trường','Bệnh viện','Trường học','Bữa sáng'], 'Môi trường', 'Environment nghĩa là môi trường.'],
      ['“Healthy” có nghĩa là gì?', ['Khỏe mạnh','Mệt mỏi','Đói bụng','Buồn ngủ'], 'Khỏe mạnh', 'Healthy nghĩa là khỏe mạnh.'],
      ['“Next week” chỉ lúc nào?', ['Tuần tới','Tuần trước','Hôm qua','Hôm nay'], 'Tuần tới', 'Next week nghĩa là tuần tới.'],
      ['Điền từ: “He ... to school every day.”', ['goes','go','going','gone'], 'goes', 'He đi cùng goes ở thì hiện tại đơn.'],
      ['“How often do you read books?” hỏi gì?', ['Bạn đọc sách thường xuyên thế nào?','Bạn đọc sách ở đâu?','Bạn đọc sách với ai?','Bạn đọc sách lúc mấy giờ?'], 'Bạn đọc sách thường xuyên thế nào?', 'How often dùng để hỏi tần suất.'],
      ['“I have a headache.” là tình trạng gì?', ['Tôi đau đầu','Tôi đau bụng','Tôi bị đau chân','Tôi đau tay'], 'Tôi đau đầu', 'Headache nghĩa là đau đầu.'],
      ['“Be careful!” có nghĩa là gì?', ['Hãy cẩn thận!','Nhanh lên!','Hãy im lặng!','Hãy đi ngủ!'], 'Hãy cẩn thận!', 'Be careful là lời nhắc cẩn thận.']
    ]
  }
};

// Các câu tự biên soạn chỉ được gắn vào chủ đề có nội dung tương ứng.
const LANGUAGE_TOPIC_INDEX: Partial<Record<Subject, Record<Grade, number>>> = {
  vietnamese: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 1 },
  english: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 1 }
};

/** Chủ đề nào có bài soạn sẵn? Các chủ đề khác vẫn dùng AI, có nhãn riêng. */
export function hasLocalQuestionBank(grade: number, subject: Subject, topicId?: string): boolean {
  if (grade < 1 || grade > 5 || !Number.isInteger(grade) || getSubjectAvailability(grade, subject) === 'unavailable') return false;
  const selectedTopic = getTopic(grade, subject, topicId);
  if (!selectedTopic || (topicId && selectedTopic.id !== topicId)) return false;
  const i = Number(selectedTopic.id.split('-').pop()) - 1;
  if (subject === 'math') return true;
  if (extraPractice.topics.some(entry => entry.topicId === selectedTopic.id && entry.grade === grade && entry.subject === subject && entry.items.length >= 3)) return true;
  return i === LANGUAGE_TOPIC_INDEX[subject]?.[grade as Grade] && !!LANGUAGE_BANK[subject]?.[grade as Grade]?.length;
}
export function getLocalQuestionCount(grade: number, subject: Subject, topicId?: string): number {
  if (!hasLocalQuestionBank(grade, subject, topicId)) return 0;
  // Một phần mấy: chỉ có tám mẫu 1/2 đến 1/9, không kéo dài đề bằng câu trùng.
  if (subject === 'math') return getTopic(grade, subject, topicId)?.id === '3-math-3' ? 8 : 10;
  const extra = extraPractice.topics.find(entry => entry.topicId === getTopic(grade, subject, topicId)?.id);
  if (extra) return Math.min(8, extra.items.length);
  return Math.min(8, LANGUAGE_BANK[subject]?.[grade as Grade]?.length || 0);
}
export function makeLocalQuiz(grade: number, subject: Subject, difficulty: Difficulty, topicId?: string): Question[] {
  if (!hasLocalQuestionBank(grade, subject, topicId)) throw new Error('Chưa có bài luyện soạn sẵn cho chủ đề này.');
  const topic = getTopic(grade, subject, topicId)!;
  const topicIndex = Number(topic.id.split('-').pop()) - 1;
  if (subject === 'math') {
    const seen = new Set<string>();
    const questions = Array.from({ length: getLocalQuestionCount(grade, subject, topicId) }, (_, i) => {
      let q = lessonMath(grade as Grade, topicIndex, i, difficulty, topic.name);
      // Hạn chế bài trùng chữ trong cùng một lượt; những chủ đề mẫu ngắn vẫn có thể lặp về kĩ năng.
      for (let retry = 0; retry < 30 && seen.has(q.text); retry++) {
        q = lessonMath(grade as Grade, topicIndex, i, difficulty, topic.name);
      }
      seen.add(q.text);
      return q;
    });
    return shuffle(questions);
  }
  const extra = extraPractice.topics.find(entry => entry.topicId === topic.id && entry.grade === grade && entry.subject === subject);
  if (extra) return shuffle(extra.items).slice(0, 8).map(item =>
    makeQuestion(item.text, item.correctAnswer, item.options.filter(answer => answer !== item.correctAnswer), item.explanation, item.hint, item.id, topic.name));
  return shuffle(LANGUAGE_BANK[subject]![grade as Grade]!).slice(0, 8).map(([text, options, answer, explanation], i) =>
    makeQuestion(text, answer, options.filter(a => a !== answer), explanation, 'Đọc kĩ câu hỏi, rồi loại dần các phương án chưa đúng.', `soan-${grade}-${subject}-${i}-${r(1, 999999)}`, topic.name));
}

/** Cổng biên tập: xuất toàn bộ câu tĩnh để giáo viên duyệt, còn Toán chỉ xuất mẫu sinh ngẫu nhiên. */
export function getEditorialPreview(grade: number, subject: Subject, topicId: string): Question[] {
  if (!hasLocalQuestionBank(grade, subject, topicId)) return [];
  const topic = getTopic(grade, subject, topicId)!;
  if (subject === 'math') {
    const index = Number(topic.id.split('-').pop()) - 1;
    // Lưu ý: xem 20 mẫu không thể thẩm định vô hạn câu do thuật toán sinh ra.
    return Array.from({length:20},(_,i)=>lessonMath(grade as Grade,index,i,'medium',topic.name));
  }
  const extra=extraPractice.topics.find(x=>x.topicId===topicId);
  if (extra) return extra.items.map(q=>({id:q.id,text:q.text,options:q.options,correctAnswer:q.correctAnswer,
    explanation:q.explanation,hint:q.hint,topic:topic.name}));
  return (LANGUAGE_BANK[subject]?.[grade as Grade] || []).map(([text,options,answer,explanation],i)=>({
    id:`draft-${grade}-${subject}-${i+1}`,text,options,correctAnswer:answer,
    explanation,topic:topic.name,hint:'Câu trong ngân hàng tĩnh, đang chờ giáo viên duyệt.'
  }));
}
