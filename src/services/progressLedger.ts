import { arrayUnion, collection, doc, runTransaction } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Activity } from '../types';
import { nextPointsAndLevel } from './pointsMath';


function profileRefOf(profileId: string) {
  const user = auth.currentUser;
  if (!user || !profileId || profileId.length > 128) {
    throw new Error('Cần đăng nhập và chọn hồ sơ hợp lệ.');
  }
  return { user, ref: doc(db, 'users', user.uid, 'profiles', profileId) };
}

function verifyActiveProfile(data: Record<string, unknown> | undefined, uid: string, profileId: string): void {
  if (!data || data.uid !== uid || data.id !== profileId) {
    throw new Error('Hồ sơ không tồn tại hoặc không thuộc tài khoản này.');
  }
  if (data.deletedAt != null || data.deleteAfter != null) {
    throw new Error('Hồ sơ đã vào Thùng rác, không thể ghi điểm.');
  }
}

/** Used by games and hints. A transaction prevents concurrent sessions losing stars. */
export async function changeStudentPoints(profileId: string, delta: number): Promise<void> {
  const { user, ref } = profileRefOf(profileId);
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    verifyActiveProfile(snap.data(), user.uid, profileId);
    const next = nextPointsAndLevel(snap.data()!.totalPoints, delta);
    tx.update(ref, next);
  });
}

/** Save a lesson and its stars/badges in ONE atomic Firestore transaction.
 * The caller generates one stable activityId per completed lesson. A repeat
 * attempt cannot overwrite a saved activity (activities allow create only).
 */
export async function commitStudentLesson(
  activity: Activity,
  activityId: string,
  earnedPoints: number,
  candidateBadges: string[]
): Promise<string[]> {
  const { user, ref } = profileRefOf(activity.profileId || '');
  if (activity.userId !== user.uid || !Number.isSafeInteger(earnedPoints) || earnedPoints < 0 ||
      !/^[a-zA-Z0-9_-]{1,128}$/.test(activityId) ||
      !Number.isInteger(activity.totalQuestions) || activity.totalQuestions < 1 ||
      activity.score < 0 || activity.score > activity.totalQuestions) {
    throw new Error('Thông tin kết quả học tập không hợp lệ.');
  }
  const activityRef = doc(collection(db, 'activities'), activityId);
  return runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    const data = snap.data();
    verifyActiveProfile(data, user.uid, activity.profileId!);
    if (data!.grade !== activity.grade) throw new Error('Lớp học đã thay đổi. Hãy mở lại bài học.');
    const next = nextPointsAndLevel(data!.totalPoints, earnedPoints);
    const oldSubjectPoints: Record<string, number> = data!.subjectPoints && typeof data!.subjectPoints === 'object'
      ? { ...data!.subjectPoints } : {};
    const previousSubjectPoints = oldSubjectPoints[activity.subject] ?? 0;
    if (!Number.isSafeInteger(previousSubjectPoints) || previousSubjectPoints < 0) {
      throw new Error('Điểm môn học không hợp lệ, chưa thể lưu.');
    }
    oldSubjectPoints[activity.subject] = previousSubjectPoints + earnedPoints;
    if (!Number.isSafeInteger(oldSubjectPoints[activity.subject])) {
      throw new Error('Điểm môn học vượt giới hạn cho phép.');
    }
    const currentBadges: string[] = Array.isArray(data!.badges) ? data!.badges : [];
    const newBadges = [...new Set(candidateBadges)].filter(id => !currentBadges.includes(id));

    tx.set(activityRef, activity);
    tx.update(ref, {
      ...next,
      subjectPoints: oldSubjectPoints,
      ...(newBadges.length ? { badges: arrayUnion(...newBadges) } : {})
    });
    return newBadges;
  });
}
