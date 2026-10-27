'use strict';
// Also called by firebase.json predeploy hooks; blocks mistakes before any hosting/function upload.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const web=JSON.parse(fs.readFileSync(path.join(root,'firebase-applet-config.json')));
const blocked=new Set(['gen-lang-client-0321861031','suc-khoe-cum-933','suc-khoe-sieu-thi-saas']);
const project=process.env.HOC_VUI_STAGING_PROJECT_ID;
if (!project || project!==web.projectId || blocked.has(project) || project.includes('REPLACE_')) {
 console.error('STOP: HOC_VUI_STAGING_PROJECT_ID phải khớp Web App projectId và là dự án thử nghiệm RIÊNG của Học Vui.');process.exit(2);
}
for(const name of ['apiKey','appId','authDomain','messagingSenderId']) {
 if(typeof web[name]!=='string'||!web[name].trim()||web[name].includes('REPLACE_')) {
  console.error(`STOP: Firebase Web App config chưa được điền trường ${name}.`);process.exit(2);
 }
}
if (web.authDomain !== `${project}.firebaseapp.com` && !web.authDomain.endsWith('.web.app')) {
 console.error('STOP: authDomain chưa được xác thực với dự án.');process.exit(2);
}
const firebase=JSON.parse(fs.readFileSync(path.join(root,'firebase.json')));
if(firebase.firestore?.database || !firebase.firestore?.rules || !firebase.firestore?.indexes) {
 console.error('STOP: Phải dùng Firestore (default) của dự án thử nghiệm và có đủ rules/indexes.');process.exit(2);
}
console.log(`PASS deploy configuration: riêng dự án Học Vui ${project}; Firestore default; cấu hình đầy đủ.`);
