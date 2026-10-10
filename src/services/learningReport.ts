import type { Activity, Subject } from '../types';

export type ReportRange = 'day' | 'week' | 'month' | 'year';
const calendar = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' });
export const vietnamDayKey = (date: Date) => calendar.format(date);
const shiftDay = (key: string, offset: number) => new Date(Date.parse(`${key}T00:00:00Z`) + offset * 86400000).toISOString().slice(0, 10);
const subjects: Subject[] = ['math', 'vietnamese', 'english', 'ethics', 'nature', 'science', 'history_geo', 'it', 'physical', 'arts', 'experiential'];
const accuracy = (correct: number, total: number) => total ? Math.round(correct / total * 100) : null;

export function reportStartDay(range: ReportRange, now: Date): string {
  const today = vietnamDayKey(now);
  if (range === 'year') return `${today.slice(0, 4)}-01-01`;
  if (range === 'month') return `${today.slice(0, 7)}-01`;
  if (range === 'week') {
    const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
    return shiftDay(today, -(weekday + 6) % 7);
  }
  return today;
}

export function buildLearningReport(activities: Activity[], owner: { uid: string; id: string }, range: ReportRange, now = new Date()) {
  const today = vietnamDayKey(now);
  const start = reportStartDay(range, now);
  // Reject invalid scores instead of converting missing/corrupt data to zero.
  // Recheck both ownership fields even when the caller has already filtered.
  const rows = activities.filter(a => {
    const stamp = typeof a.timestamp === 'string' ? Date.parse(a.timestamp) : NaN;
    return a.userId === owner.uid && a.profileId === owner.id &&
      subjects.includes(a.subject) && Number.isInteger(a.grade) && a.grade >= 1 && a.grade <= 5 &&
      Number.isFinite(stamp) && stamp <= now.getTime() &&
      Number.isSafeInteger(a.score) && Number.isSafeInteger(a.totalQuestions) &&
      a.totalQuestions > 0 && a.score >= 0 && a.score <= a.totalQuestions &&
      vietnamDayKey(new Date(stamp)) >= start;
  }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  const total = rows.reduce((n, a) => n + a.totalQuestions, 0);
  const correct = rows.reduce((n, a) => n + a.score, 0);
  const activeDays = new Set(rows.map(a => vietnamDayKey(new Date(a.timestamp)))).size;
  const subjectRows = subjects.flatMap(subject => {
    const group = rows.filter(a => a.subject === subject);
    if (!group.length) return [];
    const total = group.reduce((n, a) => n + a.totalQuestions, 0);
    const correct = group.reduce((n, a) => n + a.score, 0);
    return [{ subject, count: group.length, total, correct, accuracy: accuracy(correct, total)! }];
  });
  // A session's score belongs to a topic only if exactly one topic is known.
  const topicMap = new Map<string, { subject: Subject; grade: number; name: string; count: number; correct: number; total: number }>();
  for (const a of rows) {
    if (!Array.isArray(a.topics) || a.topics.length !== 1 || typeof a.topics[0] !== 'string' || !a.topics[0].trim()) continue;
    const name = a.topics[0].trim();
    const key = JSON.stringify([a.subject, a.grade, a.topicId || name]);
    const topic = topicMap.get(key) || { subject: a.subject, grade: a.grade, name, count: 0, correct: 0, total: 0 };
    topic.count++; topic.correct += a.score; topic.total += a.totalQuestions;
    topicMap.set(key, topic);
  }
  const topics = [...topicMap.values()].map(t => ({ ...t, accuracy: accuracy(t.correct, t.total)! }))
    .sort((a, b) => a.accuracy - b.accuracy || b.count - a.count);
  const reviewTopics = topics.filter(t => t.count >= 3 && t.accuracy < 80).slice(0, 3);
  const recentMistakes: { text: string; correctAnswer: string; userAnswer?: string; subject: Subject; grade: number; timestamp: string }[] = [];
  const seen = new Set<string>();
  for (const a of rows) {
    if (!Array.isArray(a.wrongQuestions)) continue;
    for (const q of a.wrongQuestions) {
      if (!q || typeof q.text !== 'string' || typeof q.correctAnswer !== 'string' || !q.text.trim() || !q.correctAnswer.trim()) continue;
      const key = JSON.stringify([a.subject, a.grade, q.text, q.correctAnswer]);
      if (seen.has(key)) continue;
      seen.add(key);
      if (recentMistakes.length < 5) recentMistakes.push({ text: q.text, correctAnswer: q.correctAnswer,
        ...(typeof q.userAnswer === 'string' ? { userAnswer: q.userAnswer } : {}), subject: a.subject, grade: a.grade, timestamp: a.timestamp });
    }
  }
  const keys: string[] = [];
  if (range === 'year') {
    for (let month = 1; month <= Number(today.slice(5, 7)); month++) keys.push(`${today.slice(0, 4)}-${String(month).padStart(2, '0')}`);
  } else {
    for (let day = start; day <= today; day = shiftDay(day, 1)) keys.push(day);
  }
  const timeline = keys.map(key => {
    const group = rows.filter(a => vietnamDayKey(new Date(a.timestamp)).startsWith(key));
    const total = group.reduce((n, a) => n + a.totalQuestions, 0);
    const correct = group.reduce((n, a) => n + a.score, 0);
    return { key, label: range === 'year' ? `T${Number(key.slice(5, 7))}` : `${key.slice(8, 10)}/${key.slice(5, 7)}`,
      accuracy: accuracy(correct, total), count: group.length, correct, total };
  });
  return { start, today, count: rows.length, activeDays, total, correct, accuracy: accuracy(correct, total),
    subjects: subjectRows, topics, reviewTopics, recentMistakes, timeline };
}
