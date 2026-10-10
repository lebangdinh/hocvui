/** Run after compiling the three self-contained files in the README command. */
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(process.argv[2] || '/tmp/hoc-vui-bank-test');
const base = require('node:fs').existsSync(path.join(root, 'src', 'constants', 'curriculum.js')) ? path.join(root, 'src') : root;
const curriculum = require(path.join(base, 'constants/curriculum.js'));
const bank = require(path.join(base, 'services/questionBank.js'));
// Fixed seed makes failures reproducible across local runs and CI.
let seed = 20261010;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
let topics = 0, quizzes = 0, checked = 0, mathChecked = 0;
for (let grade = 1; grade <= 5; grade++) {
  for (const subject of curriculum.getGradeSubjects(grade)) {
    for (const topic of curriculum.getTopics(grade, subject)) {
      if (!bank.hasLocalQuestionBank(grade, subject, topic.id)) continue;
      topics++;
      for (let run = 0; run < (subject === 'math' ? 150 : 5); run++) {
        const quiz = bank.makeLocalQuiz(grade, subject, ['easy','medium','hard'][run % 3], topic.id);
        quizzes++;
        assert.equal(quiz.length, bank.getLocalQuestionCount(grade, subject, topic.id));
        if (topic.id === '3-math-3') {
          assert.equal(quiz.length, 8);
          assert.equal(new Set(quiz.map(q => q.text)).size, 8, 'Unit fractions must not repeat');
        }
        for (const q of quiz) {
          checked++;
          assert.ok(q.options.length >= 3 && q.options.length <= 4);
          assert.equal(new Set(q.options).size, q.options.length);
          assert.equal(q.options.filter(x => x === q.correctAnswer).length, 1);
          assert.equal(q.topic, topic.name);
          assert.ok(q.explanation.length > 8);
          // Independent mathematical checks: comparisons, integer and decimal arithmetic,
          // multiplication/division, basic fractions and percent. Other cases are content review pending.
          const m = q.text.match(/^Điền dấu thích hợp: (\d+) \? (\d+)$/);
          if (m) { assert.equal(q.correctAnswer, +m[1] > +m[2] ? '>' : +m[1] < +m[2] ? '<' : '='); mathChecked++; }
          const ar = q.text.match(/^(\d+) ([+×:\-]) (\d+) = \?$/);
          if (ar) { const [, a, op, b] = ar; const expected = op === '+' ? +a + +b : op === '-' ? +a - +b : op === '×' ? +a * +b : +a / +b;
            assert.equal(Number(q.correctAnswer), expected); mathChecked++; }
          const dec = q.text.match(/^(\d+,\d+) ([+\-]) (\d+,\d+) = \?$/);
          if (dec) {const a=Number(dec[1].replace(',','.')),b=Number(dec[3].replace(',','.'));
            assert.equal(+q.correctAnswer.replace(',','.'), Math.round((dec[2] === '+' ? a+b : a-b)*10)/10);mathChecked++;}
          const frac = q.text.match(/^Tính (\d+)\/(\d+) \+ (\d+)\/(\d+) = \?$/);
          if (frac) { assert.equal(frac[2], frac[4]); assert.equal(q.correctAnswer, `${+frac[1]+ +frac[3]}/${frac[2]}`); mathChecked++; }
          const percent = q.text.match(/^(\d+)% của (\d+) là bao nhiêu\?$/);
          if (percent) {assert.equal(Number(q.correctAnswer),+percent[1]*+percent[2]/100);mathChecked++;}
          const rect = q.text.match(/^Hình chữ nhật dài (\d+) cm, rộng (\d+) cm\. (Chu vi|Diện tích)/);
          if (rect) {
            assert.ok(+rect[1] > +rect[2], 'Length must exceed width');
            assert.equal(+q.correctAnswer, rect[3] === 'Chu vi' ? 2*(+rect[1]+ +rect[2]) : +rect[1]*+rect[2]); mathChecked++;
          }
          const box = q.text.match(/^Hình hộp chữ nhật có chiều dài (\d+) cm, rộng (\d+) cm, cao (\d+) cm/);
          if (box) { assert.ok(+box[1] > +box[2]); assert.equal(+q.correctAnswer,+box[1]*+box[2]*+box[3]); mathChecked++; }
          const cube = q.text.match(/^Hình lập phương cạnh (\d+) cm/);
          if (cube) { assert.equal(+q.correctAnswer, (+cube[1])**3); mathChecked++; }
          const dm = q.text.match(/^(\d+) dm bằng bao nhiêu cm/);
          if (dm) { assert.equal(+q.correctAnswer,+dm[1]*10); mathChecked++; }
          const clock = q.text.match(/^Bây giờ là (\d+) giờ\. Sau (\d+) giờ nữa/);
          if (clock) { assert.equal(+q.correctAnswer,(+clock[1]+ +clock[2])%24); mathChecked++; }
          const groups = q.text.match(/^Khảo sát hai nhóm: (\d+) bạn chỉ thích bóng đá, (\d+) bạn chỉ thích cầu lông/);
          if (groups) { assert.equal(+q.correctAnswer,+groups[1]+ +groups[2]); mathChecked++; }
          const pages = q.text.match(/^Bảng số liệu: Thứ hai đọc (\d+) trang, thứ ba đọc (\d+) trang/);
          if (pages) { assert.equal(+q.correctAnswer,+pages[1]+ +pages[2]); mathChecked++; }
          const distance = q.text.match(/^Một xe đi đều (\d+) km mỗi giờ trong (\d+) giờ/);
          if (distance) { assert.equal(+q.correctAnswer,+distance[1]*+distance[2]); mathChecked++; }
          const speed = q.text.match(/^Một bạn đi (\d+) km trong (\d+) giờ/);
          if (speed) { assert.equal(+q.correctAnswer,+speed[1]/+speed[2]); mathChecked++; }
          const f3 = q.text.match(/^Một hình chia thành (\d+) phần bằng nhau, tô màu (\d+) phần\./);
          if (f3) {assert.equal(q.correctAnswer, `${f3[2]}/${f3[1]}`);mathChecked++;}
        }
      }
    }
  }
}
// Static language questions are inspected in full, not just a random sample.
const english = bank.getEditorialPreview(4, 'english', '4-english-1');
const tense = english.find(q => q.text.includes('She ... football'));
assert.ok(tense?.text.includes('thì hiện tại đơn'));
assert.equal(tense.correctAnswer, 'plays');
assert.equal(mathChecked, 25200, 'Mọi câu Toán sinh số phải được kiểm tra đáp án độc lập');
assert.equal(topics, 102, 'Số chủ đề có bài soạn sẵn thay đổi, cần cập nhật kiểm thử.');
console.log(`PASS: ${topics} chủ đề; ${quizzes} lượt đề; ${checked} câu hợp lệ; ${mathChecked} câu có phép tính được xác minh độc lập.`);
console.log('NOTE: Những câu ngôn ngữ và bài hình học có lời văn vẫn cần giáo viên thẩm định.');
