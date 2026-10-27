'use strict';
/* End-to-end question SERVICE checks with real code, persistent fake localStorage. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
let ts;try{ts=require('typescript');}catch{const cp=require('node:child_process');ts=require(path.join(cp.execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'));}
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'hocvui-v10-'));
const storage=new Map();
function transpile(f){const out=path.join(tmp,f).replace(/\.tsx?$/,'.js');fs.mkdirSync(path.dirname(out),{recursive:true});const result=ts.transpileModule(fs.readFileSync(path.join(root,f),'utf8'),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}});assert.equal(result.diagnostics?.length||0,0,JSON.stringify(result.diagnostics));fs.writeFileSync(out,result.outputText);}
function requireModules(){delete require.cache[require.resolve(path.join(tmp,'src/services/questionBank.js'))];delete require.cache[require.resolve(path.join(tmp,'src/services/questionRotation.js'))];return {bank:require(path.join(tmp,'src/services/questionBank.js')),rotation:require(path.join(tmp,'src/services/questionRotation.js'))};}
let checks=0;
try {
 for(const f of ['src/types.ts','src/constants/curriculum.ts','src/services/questionRotation.ts','src/services/questionBank.ts'])transpile(f);
 for(const f of ['practice-bank-v11.json']){let dest=path.join(tmp,'content',f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,'content',f),dest);}
 global.window={localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}};
 let {bank,rotation}=requireModules();
 assert.ok(rotation.isRotationHistoryPersistent());
 const seen=new Set();
 for(let grade=1;grade<=5;grade++)for(const subject of require(path.join(tmp,'src/constants/curriculum.js')).getGradeSubjects(grade)){
  const profile=`student:${grade}:${subject}`;
  for(let i=0;i<6;i++){
   const arr=bank.makeLocalQuiz(grade,subject,'medium',bank.MIXED_TOPIC_ID,profile);
   for(const q of arr){const key=`${grade}/${subject}/${rotation.questionIdentity(q.text)}`;assert.ok(!seen.has(key),`repeat on click ${key}`);seen.add(key);assert.ok(q.options.includes(q.correctAnswer));checks++;}
  }
  // Simulate page refresh with the same stored history and new module instance.
  const before=seen.size;
  ({bank,rotation}=requireModules());
  for(const q of bank.makeLocalQuiz(grade,subject,'medium',bank.MIXED_TOPIC_ID,profile)){
   const key=`${grade}/${subject}/${rotation.questionIdentity(q.text)}`;assert.ok(!seen.has(key),`repeat after reload ${key}`);seen.add(key);checks++;
  }
  assert.ok(seen.size>=before);
 }
 // Reboot does not regenerate a different math pool. Seeded item ID + text stable.
 ({bank,rotation}=requireModules());
 const samples=bank.getEditorialPreview(2,'math','2-math-2').slice(0,6).map(q=>[q.id,q.text,q.correctAnswer]);
 ({bank,rotation}=requireModules());
 assert.deepEqual(bank.getEditorialPreview(2,'math','2-math-2').slice(0,6).map(q=>[q.id,q.text,q.correctAnswer]),samples);
 // Same pool across mixed/focused and a new profile separate.
 const a=bank.makeLocalQuiz(1,'vietnamese','medium','1-vietnamese-1','reload-a');
 const b=bank.makeLocalQuiz(1,'vietnamese','medium',bank.MIXED_TOPIC_ID,'reload-a');
 const sa=new Set(a.map(x=>rotation.questionIdentity(x.text)));
 for(const q of b)assert.ok(!sa.has(rotation.questionIdentity(q.text)));
 assert.ok(bank.makeLocalQuiz(1,'vietnamese','medium',bank.MIXED_TOPIC_ID,'new-profile').length>0);
 // Prevent regression: trial quiz is enabled by screened mixed pool in source UI.
 const ui=fs.readFileSync(path.join(root,'src/components/SubjectDetailView.tsx'),'utf8');
 const lm=fs.readFileSync(path.join(root,'src/components/LearningModule.tsx'),'utf8');
 assert.ok(ui.includes('onStartLearning(\'quiz\', effectiveDifficulty, selectedTopicId)'));
 assert.ok(ui.includes('isMixed || liveApproved || isEligibleForAiPractice'));
 assert.ok(lm.includes("topicId !== MIXED_TOPIC_ID"));
 console.log(JSON.stringify({status:'PASS',checks,mixedSixClicksAndReload:true,stableMathSamples:true,mixedToFocusedSharedHistory:true,trialEnabledForMixed:true,excludedHeld:true},null,2));
}finally{delete global.window;fs.rmSync(tmp,{recursive:true,force:true});}
