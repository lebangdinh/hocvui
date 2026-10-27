import { collection, documentId, getDocsFromServer, limit, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Activity } from '../types';
import { BADGES } from '../constants/badges';
import { prepareLessonActivity } from './lessonActivity';
import { withDeadline } from './asyncDeadline';
import { commitStudentLesson } from './progressLedger';

type Pending = { activity: Activity; id: string; points: number; badges: string[] };
const prefix = 'hocvui.pending.v1.';
const active = new Map<string, Promise<string[]>>();
const keyOf = (uid: string, id: string) => `${prefix}${uid}.${id}`;
const changed = () => window.dispatchEvent(new Event('hocvui-pending'));
function validItem(value: Pending, uid: string): boolean {
  return !!value && value.activity?.userId === uid && typeof value.activity.profileId === 'string' &&
    /^[a-zA-Z0-9_-]{1,128}$/.test(value.id) && Number.isSafeInteger(value.points) && value.points >= 0 &&
    Array.isArray(value.badges) && value.badges.every(b => typeof b === 'string') &&
    Number.isSafeInteger(value.activity.score) && Number.isSafeInteger(value.activity.totalQuestions) &&
    value.activity.totalQuestions > 0 && value.activity.totalQuestions <= 30 &&
    value.activity.score >= 0 && value.activity.score <= value.activity.totalQuestions &&
    Number.isInteger(value.activity.grade) && value.activity.grade >= 1 && value.activity.grade <= 5 &&
    typeof value.activity.timestamp === 'string' && Number.isFinite(Date.parse(value.activity.timestamp));
}
export function pendingLessons(uid: string): Pending[] {
  const result: Pending[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (!key.startsWith(`${prefix}${uid}.`)) continue;
      try {
        const value = JSON.parse(localStorage.getItem(key)!);
        if (validItem(value, uid) && key === keyOf(uid, value.id)) result.push(value);
      } catch { /* Preserve unreadable records for recovery. */ }
    }
  } catch { /* Storage unavailable; foreground save reports this explicitly. */ }
  return result;
}
export function unreadablePendingCount(uid: string): number {
  let count = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (!key.startsWith(`${prefix}${uid}.`)) continue;
      try { if (!validItem(JSON.parse(localStorage.getItem(key)!), uid)) count++; }
      catch { count++; }
    }
  } catch { return 0; }
  return count;
}
async function sync(item: Pending): Promise<string[]> {
  const { activity, id, points } = item;
  if (auth.currentUser?.uid !== activity.userId) throw new Error('Vui lòng mở đúng tài khoản để đồng bộ.');
  const key = keyOf(activity.userId, id);
  if (active.has(key)) return active.get(key)!;
  const operation = (async () => {
    // A scoped query can read a missing activity without relaxing owner-only rules.
    const exists = async () => !(await withDeadline(getDocsFromServer(query(collection(db, 'activities'),
      where('userId', '==', activity.userId), where(documentId(), '==', id), limit(1))))).empty;
    let badges: string[] = [];
    if (!(await exists())) {
      const candidates = [...item.badges];
      // Optional rewards must never block saving the completed lesson.
      try {
        const base = [where('userId', '==', activity.userId), where('profileId', '==', activity.profileId!)];
        const [all, subject] = await withDeadline(Promise.all([
          getDocsFromServer(query(collection(db, 'activities'), ...base, limit(9))),
          getDocsFromServer(query(collection(db, 'activities'), ...base, where('subject', '==', activity.subject), limit(4)))
        ]), 8000);
        if (all.size >= 9) candidates.push('diligent');
        const mastery = `${activity.subject}_master`;
        if (subject.size >= 4 && mastery in BADGES) candidates.push(mastery);
      } catch { /* Network/rules errors are reported by the required commit below. */ }
      try {
        badges = await commitStudentLesson(activity, id, points, candidates);
      } catch (error) {
        // Another tab or a previous attempt may have committed. Create-only rules
        // roll back duplicate writes AND points atomically.
        if (!(await exists())) throw error;
      }
    }
    try { localStorage.removeItem(key); } catch { /* Already saved; retry can safely clean it later. */ }
    changed();
    window.dispatchEvent(new CustomEvent('hocvui-lesson-saved', { detail: { uid: activity.userId, profileId: activity.profileId, id } }));
    return badges;
  })();
  active.set(key, operation);
  try { return await operation; } finally { active.delete(key); }
}
export async function saveQueuedLesson(activity: Activity, id: string, points: number, badges: string[]) {
  const item: Pending = { activity: prepareLessonActivity(activity), id, points, badges };
  const key = keyOf(activity.userId, id);
  // Do not overwrite the original completion timestamp or payload on retries.
  let stored: Pending;
  try {
    const previous = localStorage.getItem(key);
    stored = previous ? JSON.parse(previous) : item;
    if (!validItem(stored, activity.userId) || stored.activity.profileId !== activity.profileId || stored.id !== id) throw new Error('invalid-pending');
    if (!previous) localStorage.setItem(key, JSON.stringify(item));
  } catch {
    throw new Error('Trình duyệt không cho lưu bản dự phòng. Hãy cho phép lưu dữ liệu hoặc giải phóng bộ nhớ rồi thử lưu lại.');
  }
  changed();
  return withDeadline(sync(stored));
}
export async function syncPendingLessons(uid: string) {
  let failure: unknown;
  for (const item of pendingLessons(uid)) {
    if (auth.currentUser?.uid !== uid) return;
    try { await withDeadline(sync(item)); } catch (error) { failure = error; }
  }
  if (failure) throw failure;
}

/** Only call after a confirmed permanent deletion, never when moving to Trash. */
export function discardPendingLessons(uid: string, profileId?: string): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (!key.startsWith(`${prefix}${uid}.`)) continue;
      if (profileId) {
        try { if (JSON.parse(localStorage.getItem(key)!).activity?.profileId !== profileId) continue; }
        catch { continue; }
      }
      keys.push(key);
    }
    keys.forEach(key => localStorage.removeItem(key));
  } finally { changed(); }
}
