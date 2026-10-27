/**
 * Dạng bài mô phỏng bài so sánh số của trang toantieuhoc của chủ dự án.
 * Nội dung tạo bằng phép toán xác định, không nhờ AI, áp dụng cho chủ đề đầu lớp 1.
 * Những môn/lớp còn lại đang sử dụng bộ sinh AI có giới hạn theo chủ đề;
 * không gắn nhãn 'đã thẩm định' cho nội dung chưa được giáo viên duyệt.
 */
import type { Question } from '../types';

export function makeReviewedGradeOneMathQuiz(): Question[] {
  const signs = ['>', '<', '=', '<', '>', '=', '>', '<', '=', '>'] as const;
  const pool = signs.map((sign, i): Question => {
    let a = Math.floor(Math.random() * 21);
    let b = a;
    if (sign !== '=') {
      // Strictly distinct and within 0..20.
      b = Math.floor(Math.random() * 20);
      if (b >= a) b++;
      if (sign === '>' && a < b || sign === '<' && a > b) [a, b] = [b, a];
    }
    return {
      id: `compare-${i}-${a}-${b}`,
      text: `Điền dấu đúng vào chỗ trống: ${a}  ?  ${b}`,
      options: ['>', '<', '='],
      correctAnswer: sign,
      topic: 'So sánh số trong phạm vi 20',
      explanation: `${a} ${sign} ${b} vì ${a === b ? 'hai số bằng nhau' : a > b ? `${a} lớn hơn ${b}` : `${a} bé hơn ${b}`}.`,
      hint: a === b ? 'Hai số bằng nhau thì dùng dấu =.' :
        `Bên trái là ${a}, bên phải là ${b}. Miệng rộng của dấu quay về số lớn.`
    };
  });
  // Shuffle questions; balance >, <, = regardless of order.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
