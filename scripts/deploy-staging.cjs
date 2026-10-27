'use strict';
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const project=process.env.HOC_VUI_STAGING_PROJECT_ID;
const doRun=(cmd,args)=>{
 const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',env:process.env,shell:process.platform==='win32'});
 if(r.status!==0)process.exit(r.status || 1);
};
// Safe by default: refuse publishing without explicit staging project and a full build.
doRun('node',['scripts/assert-deploy-config.cjs']);
doRun('node',['scripts/build-content-index.cjs']);
doRun('node',['scripts/prepare-functions.cjs']);
doRun('node',['scripts/validate-content.cjs']);
doRun('node',['scripts/security-and-coverage-test.cjs']);
doRun('node',['scripts/test-callables-mocked.cjs']);
doRun('npm',['run','lint']);
doRun('npm',['run','build']);
doRun('firebase',['deploy','--only','functions,firestore,hosting','--project',project]);
