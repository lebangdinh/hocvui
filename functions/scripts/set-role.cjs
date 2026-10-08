'use strict';
/* Run locally using GOOGLE_APPLICATION_CREDENTIALS / trusted admin workstation, never client-side. */
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const [uid, role] = process.argv.slice(2);
if (!uid || !['admin', 'reviewer', 'parent'].includes(role)) {
  console.error('Usage: node scripts/set-role.cjs FIREBASE_AUTH_UID admin|reviewer|parent');
  process.exit(2);
}
const projectId=process.env.HOC_VUI_STAGING_PROJECT_ID;
if (!projectId || projectId.startsWith('REPLACE_') || projectId === 'gen-lang-client-0321861031') {
  console.error('HOC_VUI_STAGING_PROJECT_ID phải là dự án Firebase thử nghiệm riêng của Học Vui.');process.exit(2);
}
initializeApp({projectId});
(async () => {
  const auth = getAuth();
  const user = await auth.getUser(uid);
  const claims = {...user.customClaims};
  if (role === 'parent') delete claims.role;
  else claims.role = role;
  await auth.setCustomUserClaims(uid, claims);
  console.log(`Project ${projectId}: Updated role: ${uid} => ${role}. Sign out/in to refresh the token.`);
})().catch(e => {console.error(e.message);process.exitCode=1});
