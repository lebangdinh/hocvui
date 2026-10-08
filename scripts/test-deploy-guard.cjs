'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const base=fs.mkdtempSync(path.join(os.tmpdir(),'hoc-vui-staging-guard-'));
try {
 fs.mkdirSync(path.join(base,'scripts'));
 fs.copyFileSync(path.join(root,'scripts','assert-deploy-config.cjs'),path.join(base,'scripts','assert-deploy-config.cjs'));
 fs.copyFileSync(path.join(root,'firebase.json'),path.join(base,'firebase.json'));
 const valid={apiKey:'FAKE_PUBLIC_WEB_KEY',appId:'1:123:web:fake',authDomain:'hoc-vui-staging-example.firebaseapp.com',projectId:'hoc-vui-staging-example',messagingSenderId:'123'};
 const configPath=path.join(base,'firebase-applet-config.json');
 function run(id,conf){fs.writeFileSync(configPath,JSON.stringify(conf));return spawnSync(process.execPath,[path.join(base,'scripts','assert-deploy-config.cjs')],{env:{...process.env,HOC_VUI_STAGING_PROJECT_ID:id},encoding:'utf8'});}
 assert.equal(run('hoc-vui-staging-example',valid).status,0,'Correct isolated project should be allowed');
 assert.notEqual(run('some-other-project',valid).status,0,'Project mismatch must stop deployment');
 assert.notEqual(run('hoc-vui-staging-example',{...valid,apiKey:'REPLACE_WITH_WEB_API_KEY'}).status,0,'Placeholder must stop deployment');
 assert.notEqual(run('gen-lang-client-0321861031',{...valid,projectId:'gen-lang-client-0321861031',authDomain:'gen-lang-client-0321861031.firebaseapp.com'}).status,0,'Original AI Studio project must be blocked');
 console.log('PASS deploy guard: isolated test config allowed; mismatch, placeholder and AI Studio project blocked.');
} finally {fs.rmSync(base,{recursive:true,force:true})}
