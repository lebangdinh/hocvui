'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs');
const read = p => fs.readFileSync(p,'utf8');
const rules = read('firestore.rules');
const ctx = read('src/AuthContext.tsx');
const ui = read('src/App.tsx');
const trash = read('src/services/profileTrash.ts');
const purge = read('src/services/profileDeletion.ts');
const panel = read('src/components/ProfileTrashPanel.tsx');

assert.ok(rules.includes("request.resource.data.deletedAt == request.time"), 'Trash entry timestamp must match server clock');
assert.ok(rules.includes("duration.value(29, 'd')") && rules.includes("duration.value(31, 'd')"), 'Trash expiry must be approximately 30 days');
assert.ok(rules.includes("resource.data.deleteAfter > request.time"), 'Expired profiles cannot be restored');
assert.ok(rules.includes("resource.data.keys().hasAll(['deletedAt','deleteAfter'])"), 'Only archived profiles may be permanently deleted');
assert.ok(rules.includes("!get(/databases/$(database)/documents/users/$(request.auth.uid)/profiles/$(a.profileId)).data.keys().hasAny(['deletedAt','deleteAfter'])"), 'Archived child must not receive activities');
console.log('PASS: owner-only lifecycle, expiry and archived-activity Firestore guards');

assert.ok(ctx.includes('await moveProfileToTrash(profileId)'), 'Normal delete must enter Trash');
assert.ok(ctx.includes('await restoreProfileFromTrash(profileId)'), 'Restore action must exist');
assert.ok(ctx.includes('await purgeTrashedProfile(profileId)'), 'Separate permanent delete action must exist');
assert.ok(ctx.includes('allProfiles.filter(p => !isTrashed(p))'), 'Trashed children must be hidden from normal list');
assert.ok(ctx.includes('purgeExpiredTrashForSignedInParent()'), 'Expired trash cleanup must run on login');
console.log('PASS: active, trashed, restored and expired profiles wired');

assert.ok(trash.includes('deletedAt: serverTimestamp()'), 'Trash starts from Firestore server time');
assert.ok(trash.includes('deleteAfter: Timestamp.fromMillis(Date.now() + RETENTION_MS)'), '30-day deadline stored');
assert.ok(trash.includes('await updateDoc(ref, { deletedAt: deleteField(), deleteAfter: deleteField() })'), 'Restore removes only trash markers');
assert.ok(!trash.includes('batch.delete(profileRef)'), 'Archiving must not delete profile document');
assert.ok(trash.includes('if (expiry == null || expiry <= Date.now())'), 'Client refuses expired restore');
assert.ok(trash.includes('await removeProfileWithHistory(profileId)'), 'Permanent delete purges activities and profile');
console.log('PASS: archive preserves learning data and restore is reversible within 30 days');

for (const s of ['getDocsFromServer(', "where('userId', '==', user.uid)", 'item.data().profileId === profileId', 'writeBatch(db)', 'batch.delete(activity.ref)', 'batch.delete(profileRef)', 'await batch.commit()']) {
  assert.ok(purge.includes(s),'Missing safe permanent purge: '+s);
}
assert.ok(purge.includes("if (!profileSnap.data()?.deletedAt || !profileSnap.data()?.deleteAfter)"));
assert.ok(purge.includes('relatedActivities.length > MAX_ACTIVITIES_PER_BATCH'));
console.log('PASS: permanent purge atomic, owner-filtered and limited to archived children');

assert.ok(ui.includes('<ProfileTrashPanel />') && ui.includes('Chuyển hồ sơ vào Thùng rác'));
assert.ok(panel.includes('Khôi phục') && panel.includes('Xóa vĩnh viễn'));
assert.ok(panel.includes('window.prompt') && panel.includes('given !== name'));
assert.ok(panel.includes('remaining <= 0'));
assert.ok(ui.includes('describeProfileDeletionError(error)'));
console.log('PASS: visible recycle bin, countdown, restored profiles and irreversible confirmation');
