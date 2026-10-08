import { collection, doc, getDocFromServer, getDocsFromServer, query, where, writeBatch } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * A single Firestore batch provides all-or-nothing deletion for a child
 * profile and its activity history. No backend or API key required.
 * Firestore rules must explicitly allow deletion of the owner's profile.
 */
const MAX_ACTIVITIES_PER_BATCH = 400;

export async function removeProfileWithHistory(profileId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !profileId || profileId.length > 128) {
    throw new Error('Vui lòng đăng nhập và chọn hồ sơ học sinh hợp lệ.');
  }
  const profileRef = doc(db, 'users', user.uid, 'profiles', profileId);
  const profileSnap = await getDocFromServer(profileRef);
  if (!profileSnap.exists()) throw new Error('Hồ sơ này đã được xóa hoặc không còn tồn tại.');
  if (profileSnap.data()?.uid !== user.uid || profileSnap.data()?.id !== profileId) {
    throw new Error('Bạn không có quyền xóa hồ sơ của tài khoản khác.');
  }

  // Query only the signed-in parent's history; Firestore rules prevent access
  // to any other account. Avoid composite indexes by filtering profileId here.
  const activitySnapshots = await getDocsFromServer(query(collection(db, 'activities'), where('userId', '==', user.uid)));
  const relatedActivities = activitySnapshots.docs.filter(item => item.data().profileId === profileId);

  // Never delete half a child's history. For large histories, a deployed
  // server job is required; do not attempt partial batches in the browser.
  if (relatedActivities.length > MAX_ACTIVITIES_PER_BATCH) {
    throw new Error('Hồ sơ có quá nhiều lượt học để xóa an toàn trên web. Cần quản trị viên hỗ trợ xóa bằng máy chủ.');
  }

  const batch = writeBatch(db);
  relatedActivities.forEach(activity => batch.delete(activity.ref));
  batch.delete(profileRef);
  await batch.commit(); // Server acknowledgement, not just local UI state.

  // Extra verification: do not tell the parent deletion succeeded unless
  // Firestore confirms the student document is no longer on the server.
  const check = await getDocFromServer(profileRef);
  if (check.exists()) {
    throw new Error('Máy chủ chưa xác nhận xóa hồ sơ. Vui lòng tải lại để kiểm tra.');
  }
}

export function describeProfileDeletionError(error: unknown): string {
  const code = (error && typeof error === 'object' && 'code' in error)
    ? String((error as { code?: unknown }).code || '').toLowerCase() : '';
  const msg = error instanceof Error ? error.message : '';

  if (code.includes('permission-denied') || /permission.denied|insufficient permissions/i.test(msg)) {
    return 'Firebase chưa cho phép xóa hồ sơ. Cần xuất bản Firestore Rules mới của Học Vui trước khi thử lại. Chưa có dữ liệu nào bị xóa.';
  }
  if (msg.includes('quá nhiều lượt học')) return msg;
  if (msg.includes('đã được xóa') || msg.includes('không còn tồn tại')) return msg;
  if (msg.includes('Máy chủ chưa xác nhận')) return msg;
  if (code.includes('unavailable') || code.includes('deadline-exceeded') || code.includes('network')) {
    return 'Chưa xác nhận được kết quả xóa do mất kết nối Firebase. Vui lòng tải lại để kiểm tra trước khi thử tiếp.';
  }
  if (code.includes('unauthenticated')) return 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập Google rồi thử lại.';
  return 'Chưa xóa được hồ sơ. Dữ liệu vẫn được giữ nguyên nếu Firebase từ chối thao tác. Vui lòng thử lại hoặc liên hệ quản trị viên.';
}
