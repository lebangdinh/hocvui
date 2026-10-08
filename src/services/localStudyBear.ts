/** Predictable, non-generative replies for primary school learners.
 * This never claims to be an AI answer. Unsupported questions must not be
 * guessed or routed to an invented answer.
 */
export type LocalStudyReply = { text: string; category: 'greeting' | 'math' | 'guidance' | 'safety' };

function normalize(text: string): string {
  return text.normalize('NFC').trim().toLocaleLowerCase('vi-VN').replace(/\s+/g, ' ');
}

export function getLocalStudyReply(input: string, grade: number): LocalStudyReply | null {
  const raw = normalize(input);
  if (!raw) return null;
  const msg = raw.replace(/[.!?…]+$/g, '').trim();
  const cls = Number.isInteger(grade) && grade >= 1 && grade <= 5 ? grade : 2;

  if (/^(chào|chào gấu|chào gấu nhỏ|xin chào|xin chào gấu|hi|hello|hey|alo|gấu ơi|chào bạn|chào bé)$/.test(msg)) {
    return {
      category: 'greeting',
      text: 'Gấu chào bé! 🐻💛 Hôm nay mình cùng học nhé! Bé có thể hỏi Gấu một phép tính đơn giản như “2 + 3 bằng bao nhiêu?”, hoặc chọn môn học ở trang chính. Gấu đang ở chế độ hỗ trợ cơ bản nhé!'
    };
  }

  if (/^(cảm ơn|cám ơn|cảm ơn gấu|cám ơn gấu|thank you|thanks|cảm ơn bạn)$/.test(msg)) {
    return { category: 'greeting', text: 'Không có gì đâu! 🐻 Bé cứ học từng chút một nhé. Khi nào cần, Gấu luôn sẵn sàng hướng dẫn những phần cơ bản!' };
  }

  if (/^(tạm biệt|bye|goodbye|chào tạm biệt|ngủ ngon|hẹn gặp lại)$/.test(msg)) {
    return { category: 'greeting', text: 'Tạm biệt bé! 🌟 Chúc bé có một ngày thật vui. Hẹn gặp lại trong giờ học nhé!' };
  }

  if (/^(gấu là ai|bạn là ai|ai đây|bạn làm được gì|gấu làm được gì|giúp được gì|bé hỏi gì được|hướng dẫn)$/.test(msg)) {
    return {
      category: 'guidance',
      text: 'Gấu Nhỏ là người bạn hỗ trợ học tập trong Học Vui. 🐻 Gấu có thể trò chuyện ngắn, làm các phép tính đơn giản và chỉ bé cách tìm bài học. Để giải thích những câu hỏi khó hơn, cần kết nối máy chủ AI; Gấu sẽ thông báo rõ khi tính năng ấy chưa sẵn sàng.'
    };
  }

  if (/(mật khẩu|địa chỉ nhà|số điện thoại|mã otp|mã xác thực|thông tin cá nhân)/.test(msg)) {
    return {
      category: 'safety',
      text: 'Bé đừng gửi mật khẩu, địa chỉ nhà hay số điện thoại vào khung trò chuyện nhé. 💛 Nếu bé cần giúp về tài khoản, hãy gọi ba mẹ hoặc thầy cô.'
    };
  }

  if (/(cứu con|bị đánh|bị thương|nguy hiểm|đau dữ dội|cấp cứu)/.test(msg)) {
    return {
      category: 'safety',
      text: 'Nếu bé đang gặp nguy hiểm hoặc bị thương, hãy gọi ngay ba mẹ, thầy cô hoặc một người lớn đáng tin cậy ở gần. 💛 Đừng chờ trả lời qua trò chuyện nhé!'
    };
  }

  if (/(buồn quá|con buồn|con sợ|con lo lắng|con khóc)/.test(msg)) {
    return {
      category: 'safety',
      text: 'Gấu nghe bé nói đây. 💛 Bé có thể kể chuyện này với ba mẹ hoặc thầy cô mà bé tin tưởng. Nghỉ một chút, uống nước rồi quay lại học khi bé thấy thoải mái hơn nhé.'
    };
  }

  // Strictly two small integers and one operator. Never evaluate arbitrary
  // expressions, guess word problems, or send private content anywhere.
  const mathText = msg
    .replace(/\b(cộng|cong)\b/g, '+')
    .replace(/\b(trừ|tru)\b/g, '-')
    .replace(/\b(nhân|nhan)\b/g, '×')
    .replace(/\b(chia)\b/g, '÷');
  const found = mathText.match(/^(?:(?:tính|tinh|cho gấu biết|gấu ơi,?)\s*)?(\d{1,5})\s*([+\-−×x*÷/:])\s*(\d{1,5})(?:\s*(?:bằng bao nhiêu|bang bao nhieu|bằng mấy|là mấy|là bao nhiêu|=|\?))?$/);
  if (found) {
    const left = Number(found[1]);
    const op = found[2];
    const right = Number(found[3]);
    if (left > 10000 || right > 10000) return null;
    const opName = op === '+' ? 'cộng' : (op === '-' || op === '−') ? 'trừ' : (op === '×' || op === 'x' || op === '*') ? 'nhân' : 'chia';
    if (opName === 'chia' && right === 0) {
      return { category: 'math', text: 'Không thể chia một số cho 0 đâu bé nhé. 🐻 Mình thử một phép chia khác nào!' };
    }
    const result = opName === 'cộng' ? left + right : opName === 'trừ' ? left - right : opName === 'nhân' ? left * right : left / right;
    const rendered = Number.isInteger(result) ? String(result) : Number(result.toFixed(4)).toLocaleString('vi-VN');
    const expression = `${left} ${opName} ${right}`;
    let note = 'Bé có thể thử thêm một phép tính nữa nhé!';
    if (opName === 'cộng' && left <= 10 && right <= 10) note = `Ví dụ: có ${left} món đồ, thêm ${right} món nữa thì có ${result} món.`;
    if (opName === 'nhân' && right <= 10 && left <= 10) note = `Vì có ${right} nhóm, mỗi nhóm ${left} phần nên tất cả là ${result} phần.`;
    if (opName === 'chia' && Number.isInteger(result)) note = `Chia đều ${left} món thành ${right} nhóm thì mỗi nhóm được ${result} món.`;
    return {
      category: 'math',
      text: `🧮 **${expression} = ${rendered}**. ${note}`
    };
  }

  if (/^(học gì|học thế nào|học như thế nào|làm sao học tốt|mình học gì|gợi ý bài học|ôn tập như thế nào)$/.test(msg)) {
    return {
      category: 'guidance',
      text: `Bé học lớp ${cls} có thể bắt đầu bằng môn Toán hoặc Tiếng Việt nhé! 📚 Mình thử học khoảng 10–15 phút, làm một bài ngắn rồi nghỉ mắt một chút. Bé chọn môn học ở trang chính để bắt đầu nào!`
    };
  }

  if (/(học toán|môn toán|luyện toán|bài toán|toán lớp|học tiếng việt|môn tiếng việt|chính tả|luyện đọc|học tiếng anh|môn tiếng anh|english)/.test(msg)) {
    const subject = /(tiếng việt|chính tả|luyện đọc)/.test(msg) ? 'Tiếng Việt' : /(tiếng anh|english)/.test(msg) ? 'Tiếng Anh' : 'Toán';
    return {
      category: 'guidance',
      text: `Hay quá! 📚 Bé trở về trang chính, chọn môn **${subject}** của lớp ${cls} để xem bài luyện tập nhé. Nếu muốn tính nhanh, bé có thể hỏi Gấu phép tính như “7 + 5 bằng bao nhiêu?”.`
    };
  }

  return null;
}

export function unavailableAIMessage(): string {
  return 'Gấu hiện **chưa kết nối được máy chủ AI**, nên chưa thể trả lời chính xác câu hỏi này. 🐻 Bé có thể hỏi một phép tính đơn giản hoặc trở về chọn bài luyện tập. Với câu hỏi khó, hãy nhờ ba mẹ hoặc thầy cô giúp nhé!';
}
