import { doc, getDocFromServer, getDocsFromServer, collection, deleteField, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { removeProfileWithHistory } from './profileDeletion';

export const TRASH_RETENTION_DAYS = 30;
const RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function trashExpiryMillis(profile: {deleteAfter?: unknown}): number | null {
  const value = profile.deleteAfter;
  if (!value || typeof value !== 'object' || !('toMillis' in value)) return null;
  const toMillis = (value as {toMillis?: unknown}).toMillis;
  if (typeof toMillis !== 'function') return null;
  const time = (toMillis as () => number).call(value);
  return Number.isFinite(time) ? time : null;
}

export function isTrashed(profile: {deletedAt?: unknown; deleteAfter?: unknown}): boolean {
  return profile.deletedAt != null || profile.deleteAfter != null;
}

function myProfile(profileId: string) {
  const user = auth.currentUser;
  if (!user || !profileId || profileId.length > 128) throw new Error('Cần đăng nhập để quản lý Thùng rác.');
  return doc(db, 'users', user.uid, 'profiles', profileId);
}

/** A single profile update; all achievements and activities remain untouched. */
export async function moveProfileToTrash(profileId: string): Promise<void> {
  const ref = myProfile(profileId);
  const snap = await getDocFromServer(ref);
  if (!snap.exists()) throw new Error('Không tìm thấy hồ sơ cần chuyển vào Thùng rác.');
  if (isTrashed(snap.data())) throw new Error('Hồ sơ đã nằm trong Thùng rác.');

  await updateDoc(ref, {
    deletedAt: serverTimestamp(),
    deleteAfter: Timestamp.fromMillis(Date.now() + RETENTION_MS)
  });
  const confirmed = await getDocFromServer(ref);
  if (!confirmed.exists() || !isTrashed(confirmed.data())) {
    throw new Error('Firebase chưa xác nhận hồ sơ đã vào Thùng rác. Hãy tải lại trang để kiểm tra.');
  }
}

/** Restore only during the retention period. Neither points nor history changes. */
export async function restoreProfileFromTrash(profileId: string): Promise<void> {
  const ref = myProfile(profileId);
  const snap = await getDocFromServer(ref);
  if (!snap.exists()) throw new Error('Không tìm thấy hồ sơ trong Thùng rác.');
  if (!isTrashed(snap.data())) throw new Error('Hồ sơ này đã được khôi phục.');
  const expiry = trashExpiryMillis(snap.data());
  if (expiry == null || expiry <= Date.now()) throw new Error('Đã hết thời hạn 30 ngày, không thể khôi phục hồ sơ.');

  await updateDoc(ref, { deletedAt: deleteField(), deleteAfter: deleteField() });
  const confirmed = await getDocFromServer(ref);
  if (!confirmed.exists() || isTrashed(confirmed.data())) {
    throw new Error('Firebase chưa xác nhận khôi phục. Hãy tải lại trang để kiểm tra.');
  }
}

/** Permanent deletion is only allowed for a child already in Trash. */
export async function purgeTrashedProfile(profileId: string): Promise<void> {
  const ref = myProfile(profileId);
  const snap = await getDocFromServer(ref);
  if (!snap.exists()) throw new Error('Hồ sơ đã được dọn khỏi Thùng rác.');
  if (!isTrashed(snap.data())) throw new Error('Cần chuyển hồ sơ vào Thùng rác trước khi xóa vĩnh viễn.');
  await removeProfileWithHistory(profileId);
}

/**
 * Best-effort garbage collection whenever the parent's web app opens.
 * Spark/Pages has no background task that runs while the website is closed.
 * Expired records must never be restored, even if physical deletion is delayed.
 */
export async function purgeExpiredTrashForSignedInParent(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const snapshot = await getDocsFromServer(collection(db, 'users', user.uid, 'profiles'));
  const now = Date.now();
  const expired = snapshot.docs
    .filter(item => isTrashed(item.data()) && (trashExpiryMillis(item.data()) ?? Number.NEGATIVE_INFINITY) <= now);
  const errors: string[] = [];
  for (const item of expired) {
    try { await purgeTrashedProfile(item.id); }
    catch (error) {
      console.warn('Expired trash purge failed:', error instanceof Error ? error.message : 'unknown');
      errors.push(item.data().displayName || item.id);
    }
  }
  if (errors.length) throw new Error('Chưa dọn được một số hồ sơ quá hạn: ' + errors.join(', ') + '. Nếu có quá nhiều lịch sử, cần xử lý bằng máy chủ.');
}
