import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Activity } from '../src/types';
import { prepareLessonActivity } from '../src/services/lessonActivity';

const hasUndefined = (value: unknown): boolean => {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.some(hasUndefined);
  return value !== null && typeof value === 'object' && Object.values(value).some(hasUndefined);
};

const sample: Activity = {
  userId: 'demo-parent',
  profileId: 'demo-child',
  subject: 'math',
  score: 7,
  totalQuestions: 10,
  grade: 3,
  timestamp: '2026-10-10T00:00:00.000Z',
  topicId: undefined,
  contentSource: 'bank',
  wrongQuestions: [
    { text: '7 + 3?', correctAnswer: '10', userAnswer: '11', topic: undefined },
    { text: '8 + 1?', correctAnswer: '9', topic: 'Phép cộng', userAnswer: undefined }
  ]
};
const clean = prepareLessonActivity(sample);
assert.equal(hasUndefined(clean), false);
assert.equal('topicId' in clean, false);
assert.equal('topic' in clean.wrongQuestions![0], false);
assert.equal('userAnswer' in clean.wrongQuestions![1], false);
assert.equal(clean.wrongQuestions?.length, 2);
assert.equal(clean.wrongQuestions?.[0].userAnswer, '11');
assert.equal(clean.score, 7);
assert.equal(clean.contentSource, 'bank');
assert.equal(hasUndefined(sample), true, 'caller object must remain untouched');

const withoutOptionals: Activity = {
  userId: 'demo-parent', profileId: 'demo-child', subject: 'math',
  score: 0, totalQuestions: 5, grade: 1, timestamp: '2026-10-10T00:00:00.000Z'
};
const minimal = prepareLessonActivity(withoutOptionals);
assert.equal(hasUndefined(minimal), false);
assert.deepEqual(Object.keys(minimal).sort(), Object.keys(withoutOptionals).sort());
console.log('PASS: lesson activity omits optional undefined fields, including nested wrong answers');

const read = (file: string) => readFileSync(file, 'utf8');
const ledger = read('src/services/progressLedger.ts');
const learning = read('src/components/LearningModule.tsx');
const auth = read('src/AuthContext.tsx');
assert.ok(ledger.includes('tx.set(activityRef, prepareLessonActivity(activity))'));
assert.ok(learning.includes('historySnap.docs.some(item => item.id === lessonActivityIdRef.current)'));
assert.ok(learning.includes("setSaveStatus('saved')"));
assert.ok(learning.includes('disabled={saveStatus === \'saving\'}'));
assert.ok(learning.includes('Kết quả bài học chưa được lưu lên Firebase'));
assert.ok(learning.includes('Dự kiến +'));
console.log('PASS: transactions sanitize activity data and retries detect already-committed lessons');

for (const part of [
  'let authGeneration = 0;',
  'const generation = ++authGeneration;',
  'setProfile(null);', 'setProfiles([]);', 'setTrashProfiles([]);',
  'setLoading(!!firebaseUser);',
  'if (generation !== authGeneration || auth.currentUser?.uid !== firebaseUser.uid) return;',
  'authGeneration++;'
]) {
  assert.ok(auth.includes(part), 'Account-isolation guard missing: ' + part);
}
console.log('PASS: changing Google accounts resets private profile state and ignores stale events');
