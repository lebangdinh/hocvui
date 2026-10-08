/** Run after compiling the three self-contained files in the README command. */
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(process.argv[2] || '/tmp/hoc-vui-bank-test');
const base = require('node:fs').existsSync(path.join(root, 'src', 'constants', 'curriculum.js')) ? path.join(root, 'src') : root;
const curriculum = require(path.join(base, 'constants/curriculum.js'));
const bank = require(path.join(base, 'services/questionBank.js'));
let topics = 0, quizzes = 0, checked = 0, mathChecked = 0;
for (let grade = 1; grade <= 5; grade++) {
  for (const subject of curriculum.getGradeSubjects(grade)) {
    for (const topic of curriculum.getTopics(grade, subject)) {
      if (!bank.hasLocalQuestionBank(grade, subject, topic.id)) continue;
      topics++;
      for (let run = 0; run < (subject === 'math' ? 150 : 5); run++) {
        const quiz = bank.makeLocalQuiz(grade, subject, ['easy','medium','hard'][run % 3], topic.id);
        quizzes++;
        assert.equal(quiz.length, subject === 'math' ? 10 : bank.getLocalQuestionCount(grade, subject, topic.id));
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
          const f3 = q.text.match(/^Một hình chia thành (\d+) phần bằng nhau, tô màu (\d+) phần\./);
          if (f3) {assert.equal(q.correctAnswer, `${f3[2]}/${f3[1]}`);mathChecked++;}
        }
      }
    }
  }
}
assert.equal(topics, 102, 'Số chủ đề có bài soạn sẵn thay đổi, cần cập nhật kiểm thử.');
console.log(`PASS: ${topics} chủ đề; ${quizzes} lượt đề; ${checked} câu hợp lệ; ${mathChecked} câu có phép tính được xác minh độc lập.`);
console.log('NOTE: Những câu ngôn ngữ và bài hình học có lời văn vẫn cần giáo viên thẩm định.');
