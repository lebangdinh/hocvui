import assert from 'node:assert/strict';
import { getLocalStudyReply, unavailableAIMessage } from '../src/services/localStudyBear';

function reply(input: string, grade = 1) {
  return getLocalStudyReply(input, grade)?.text ?? null;
}

const cases: Array<[string, string, string]> = [
  ['Chào gấu', 'Gấu chào bé', 'natural greeting'],
  ['Xin chào!', 'Gấu chào bé', 'greeting punctuation'],
  ['2 + 3 bằng bao nhiêu?', '2 cộng 3 = 5', 'primary-school addition'],
  ['7 x 8', '7 nhân 8 = 56', 'multiplication'],
  ['7 nhân 8', '7 nhân 8 = 56', 'Vietnamese multiplication'],
  ['5 trừ 2', '5 trừ 2 = 3', 'Vietnamese subtraction'],
  ['8 chia 2', '8 chia 2 = 4', 'Vietnamese division'],
  ['9 : 3', '9 chia 3 = 3', 'division'],
  ['5 : 0', 'Không thể chia', 'division-by-zero safety'],
  ['2 - 7', '2 trừ 7 = -5', 'negative result'],
  ['Cảm ơn Gấu!', 'Không có gì', 'thank you'],
  ['Làm sao học tốt', 'Bé học lớp 1', 'age-appropriate guidance'],
  ['Học tiếng Việt', 'Tiếng Việt', 'subject routing'],
  ['Địa chỉ nhà', 'địa chỉ nhà', 'do not ask for personal data'],
  ['Con buồn quá', 'ba mẹ', 'appropriate emotional support'],
];

for (const [input, includes, name] of cases) {
  const actual = reply(input);
  assert.ok(actual?.includes(includes), `${name}: ${JSON.stringify(actual)}`);
  console.log(`PASS: ${name}`);
}
for (const input of ['2 + 3 * 4', '6 / (2+1)', 'Công thức tính diện tích hình tròn là gì?', 'bài này khó quá giúp gấu']) {
  assert.equal(reply(input), null, `should not invent answer to: ${input}`);
  console.log(`PASS: unsupported prompt is not guessed: ${input}`);
}
assert.match(unavailableAIMessage(), /chưa kết nối được máy chủ AI/);
assert.doesNotMatch(unavailableAIMessage(), /hắt xì|quên mất|đang sẵn sàng/i);
console.log('PASS: honest AI connection disclosure');
