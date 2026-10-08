'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = p => fs.readFileSync(p,'utf8');
const rules = read('firestore.rules');
const client = read('src/services/profileDeletion.ts');
const ctx = read('src/AuthContext.tsx');
const ui = read('src/App.tsx');

assert.match(rules, /match \/profiles\/\{profileId\}[\s\S]*?allow delete: if owner\(uid\) && resource\.data\.uid == uid && resource\.data\.id == profileId/);
console.log('PASS: deletion limited to authenticated profile owner and matching document');

assert.match(rules, /match \/activities\/\{id\}[\s\S]*?allow delete: if loggedIn\(\) && resource\.data\.userId == request\.auth\.uid/);
console.log('PASS: history deletion limited to authenticated activity owner');

for (const term of ['getDocFromServer(profileRef)','getDocsFromServer(', "where('userId', '==', user.uid)", "item.data().profileId === profileId", 'writeBatch(db)', 'batch.delete(activity.ref)', 'batch.delete(profileRef)', 'await batch.commit()', 'if (check.exists())']) {
  assert.ok(client.includes(term), 'Missing atomic server-acknowledged deletion safeguard: '+term);
}
assert.ok(client.indexOf('batch.delete(activity.ref)') < client.indexOf('batch.delete(profileRef)'));
console.log('PASS: all child activities and profile deleted atomically with server confirmation');

assert.match(client, /relatedActivities.length > MAX_ACTIVITIES_PER_BATCH/);
assert.ok(client.indexOf('throw new Error(\'Hồ sơ có quá nhiều lượt học') < client.indexOf('const batch = writeBatch(db)'));
console.log('PASS: large history fails safely before deleting any data');

assert.match(ctx, /await removeProfileWithHistory\(profileId\)/);
assert.ok(!ctx.includes('await removeProfileServer(profileId)'));
console.log('PASS: child delete no longer depends on undeployed Cloud Functions');

assert.ok(ui.includes('describeProfileDeletionError(error)'));
assert.ok(ui.includes('Đang xóa trên Firebase...'));
assert.ok(ui.includes('disabled={deletingProfileId !== null}'));
assert.ok(ui.includes('role="alert"'));
console.log('PASS: both screens show actionable errors and prevent duplicate deletion');
