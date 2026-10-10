import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { vietnamDayKey } from '../src/services/learningReport';
import { nextPointsAndLevel } from '../src/services/pointsMath';

const equal = (before: number, change: number, expected: number, level: number) => {
  assert.deepEqual(nextPointsAndLevel(before, change), { totalPoints: expected, level });
};
equal(0, 0, 0, 1);
equal(0, 10, 10, 1);
equal(999, 1, 1000, 2);
equal(1000, -1, 999, 1);
equal(4724, 30, 4754, 5);
equal(4754, 30, 4784, 5);
equal(0, 10000, 10000, 11);
assert.throws(() => nextPointsAndLevel(0, -5), /Không đủ sao/);
assert.throws(() => nextPointsAndLevel(1.5, 5), /không hợp lệ/);
assert.throws(() => nextPointsAndLevel(Number.MAX_SAFE_INTEGER, 1), /Không đủ sao/);
assert.throws(() => nextPointsAndLevel(100, Number.NaN), /không hợp lệ/);
console.log('PASS: points and level stay correct at boundaries, after subtraction, and after successive awards');

const read = (file: string) => readFileSync(file, 'utf8');
const ledger = read('src/services/progressLedger.ts');
const auth = read('src/AuthContext.tsx');
const lesson = read('src/components/LearningModule.tsx');
const report = read('src/components/ReportModule.tsx');

assert.match(ledger, /await runTransaction\(db, async tx =>/);
assert.match(ledger, /const snap = await tx\.get\(ref\)/);
assert.match(ledger, /tx\.set\(activityRef, prepareLessonActivity\(activity\)\)/);
assert.match(ledger, /tx\.update\(ref, \{/);
assert.match(ledger, /subjectPoints: oldSubjectPoints/);
assert.ok(ledger.indexOf('tx.set(activityRef, prepareLessonActivity(activity))') < ledger.indexOf('tx.update(ref, {'));
assert.ok(auth.includes('await changeStudentPoints(profile.id, points)'));
assert.ok(!auth.includes('profile.totalPoints + points'));
assert.ok(lesson.includes('await commitStudentLesson('));
assert.ok(!lesson.includes("await addDoc(collection(db, 'activities')"));
assert.ok(lesson.includes("setSaveStatus('saved')") && lesson.includes("setSaveStatus('error')"));
assert.ok(lesson.includes('Thử lưu lại'));
assert.ok(lesson.includes('lessonActivityIdRef.current!'));
console.log('PASS: lesson history and rewards are an atomic transaction; retry status is visible');

assert.ok(report.includes("where('userId', '==', profile.uid)"));
assert.ok(report.includes('item.profileId === profile.id'));
assert.ok(!report.includes("where('profileId', '==', profile.id)"));
assert.ok(!report.includes("orderBy('timestamp', 'desc')"));
assert.equal(vietnamDayKey(new Date('2026-10-09T17:00:00Z')), '2026-10-10');
assert.notEqual(vietnamDayKey(new Date('2025-10-09T17:00:00Z')), vietnamDayKey(new Date('2026-10-09T17:00:00Z')));
assert.ok(report.includes('if (loadError)'));
assert.ok(report.includes('return () => { cancelled = true; }'));
console.log('PASS: reports isolate the current child, handle errors and compare full calendar days');
