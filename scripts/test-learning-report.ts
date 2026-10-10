import assert from 'node:assert/strict';
import type { Activity } from '../src/types';
import { buildLearningReport, reportStartDay, vietnamDayKey } from '../src/services/learningReport';
const owner = { uid: 'parent', id: 'child' };
const now = new Date('2026-10-10T04:30:00Z');
const item = (overrides: Partial<Activity> = {}): Activity => ({
  userId: 'parent', profileId: 'child', subject: 'math', grade: 3, score: 8, totalQuestions: 10,
  timestamp: '2026-10-10T01:00:00Z', topicId: '3-math-3', topics: ['Một phần mấy'], ...overrides
});
assert.equal(vietnamDayKey(new Date('2026-10-09T17:00:00Z')), '2026-10-10');
assert.equal(reportStartDay('week', now), '2026-10-05');
assert.equal(reportStartDay('week', new Date('2026-10-11T17:01:00Z')), '2026-10-12');
assert.equal(reportStartDay('week', new Date('2026-10-11T00:00:00Z')), '2026-10-05');
assert.equal(reportStartDay('month', now), '2026-10-01');
assert.equal(reportStartDay('year', now), '2026-01-01');
const empty = buildLearningReport([], owner, 'week', now);
assert.equal(empty.accuracy, null);
assert.equal(empty.timeline.length, 6);
assert.ok(empty.timeline.every(d => d.accuracy === null));
const weighted = buildLearningReport([item({score: 8, totalQuestions: 8}), item({score: 0, totalQuestions: 10})], owner, 'day', now);
assert.equal(weighted.correct, 8); assert.equal(weighted.total, 18);
assert.equal(weighted.accuracy, 44); // Not the misleading mean of 100% and 0%.
assert.equal(weighted.subjects[0].accuracy, 44);
assert.equal(weighted.timeline[0].accuracy, 44);
assert.equal(weighted.activeDays, 1);
const zero = buildLearningReport([item({score: 0})], owner, 'day', now);
assert.equal(zero.accuracy, 0); assert.equal(zero.timeline[0].accuracy, 0);
const bad: Activity[] = [item({profileId: 'sibling'}), item({userId: 'other-parent'}),
  item({timestamp: '2025-10-10T01:00:00Z'}), item({timestamp: 'bad'}),
  item({timestamp: '2026-10-11T01:00:00Z'}), item({score: -1}), item({score: NaN}),
  item({score: 11}), item({totalQuestions: 0}), item({score: 2.5}), item({grade: 0}),
  item({score: undefined as any}), item({subject: 'unknown' as any})];
assert.equal(buildLearningReport(bad, owner, 'year', now).count, 0);
const boundary = buildLearningReport([
  item({timestamp:'2026-10-09T16:59:59Z'}), item({timestamp:'2026-10-09T17:00:00Z'})
], owner, 'day', now);
assert.equal(boundary.count, 1);
const wrong = {text:'Một câu sai',correctAnswer:'2',userAnswer:'3'};
const samples = [item({score: 5, wrongQuestions:[wrong]}),item({score: 6}),item({score: 7, wrongQuestions:[wrong]})];
const report = buildLearningReport(samples, owner, 'week', now);
assert.equal(report.reviewTopics.length, 1); assert.equal(report.reviewTopics[0].accuracy, 60);
assert.equal(report.recentMistakes.length, 1);
assert.equal(buildLearningReport(samples.slice(0,2),owner,'week',now).reviewTopics.length, 0);
assert.equal(buildLearningReport([item(),item(),item()], owner,'week',now).reviewTopics.length, 0);
assert.equal(buildLearningReport(samples.map(a=>({...a,topics:['A','B']})),owner,'week',now).topics.length,0);
assert.equal(buildLearningReport([item(),item({grade:4})],owner,'week',now).topics.length,2);
const year = buildLearningReport([item(),item({timestamp:'2026-01-01T00:00:00Z'})],owner,'year',now);
assert.equal(year.timeline.length,10); assert.equal(year.activeDays,2);
assert.equal(year.timeline[1].accuracy,null);
const january = buildLearningReport([],owner,'week',new Date('2026-01-01T00:00:00Z'));
assert.equal(january.start,'2025-12-29');
assert.deepEqual(samples[0].wrongQuestions,[wrong], 'Input is never mutated');
console.log('PASS: Vietnam calendar boundaries, Monday weeks, weighted scores, zero vs missing, ownership, invalid/future data, evidence thresholds and mistake deduplication');
