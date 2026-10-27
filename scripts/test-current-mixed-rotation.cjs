'use strict';
/** Run actual transpiled TS quiz code, not a mock picker. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
let ts;try{ts=require('typescript');}catch{const {execFileSync}=require('node:child_process');ts=require(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'typescript'));}
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'hocvui-current-'));
const memory=new Map();
function transpile(f){let out=path.join(tmp,f).replace(/\.tsx?$/,'.js');fs.mkdirSync(path.dirname(out),{recursive:true});let t=ts.transpileModule(fs.readFileSync(path.join(root,f),'utf8'),{fileName:f,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}});assert.equal(t.diagnostics?.length||0,0,JSON.stringify(t.diagnostics));fs.writeFileSync(out,t.outputText);}
try{
 for(const f of ['src/types.ts','src/constants/curriculum.ts','src/services/questionRotation.ts','src/services/questionBank.ts'])transpile(f);
 for(const f of ['practice-bank-v11.json']){const dest=path.join(tmp,'content',f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,'content',f),dest);}
 global.window={localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}};
 const bank=require(path.join(tmp,'src/services/questionBank.js'));
 const cr=require(path.join(tmp,'src/constants/curriculum.js'));
 const rot=require(path.join(tmp,'src/services/questionRotation.js'));
 const original=require(path.join(tmp,'content/practice-bank-v11.json'));
 const allowed=new Set(original.topics.flatMap(t=>t.items.map(q=>q.id)));
 const indexed=new Map(original.topics.flatMap(t=>t.items.map(q=>[q.id,{...q,rotationTopicId:t.topicId}])));
 const report={subjectsTested:0,focusedTopicsTested:0,mixedSessions:0,focusedSessions:0,mixedQuestions:0,focusedQuestions:0,exhaustionCases:0,crossModeChecks:0,heldUsed:0,exactDuplicates:0,conceptDuplicates:0};
 const validate=(quiz,seen,topic,math,seenConcepts)=>{const inSession=new Set();const inSessionConcepts=new Set();for(const q of quiz){assert.ok(q.options.includes(q.correctAnswer),'missing answer '+q.id);assert.equal(q.options.filter(o=>o===q.correctAnswer).length,1,'bad options '+q.id);if(!math){assert.ok(allowed.has(q.id),'held question '+q.id);}
  const text=rot.questionIdentity(q.text);assert.ok(!inSession.has(text),'within-session duplicate '+topic+': '+text);inSession.add(text);assert.ok(!seen.has(text),'across-session duplicate '+topic+': '+text);seen.add(text);
  if(!math){const item=indexed.get(q.id);assert.ok(item);const concept=rot.questionConceptIdentity(item);assert.ok(!inSessionConcepts.has(concept),'same concept within quiz '+topic+': '+concept);inSessionConcepts.add(concept);if(seenConcepts){assert.ok(!seenConcepts.has(concept),'same concept across quizzes '+topic+': '+concept);seenConcepts.add(concept);}}
  if(!math&&!allowed.has(q.id))report.heldUsed++;
 }};
 for(let grade=1;grade<=5;grade++)for(const subject of cr.getGradeSubjects(grade)){
  const topics=cr.getTopics(grade,subject);
  const profile='currentmixed:'+grade+':'+subject;
  const usedText=new Set(),usedConcepts=new Set(); const firstTopic=topics[0];
  const first=bank.makeLocalQuiz(grade,subject,'medium',firstTopic.id,profile);
  assert.ok(first.length>0,firstTopic.id+' no focus');validate(first,usedText,firstTopic.id,subject==='math',usedConcepts);
  report.focusedSessions++;report.focusedQuestions+=first.length;report.focusedTopicsTested++;
  if(subject!=='math'){
   const left=bank.getUnseenQuestionCount(grade,subject,bank.MIXED_TOPIC_ID,profile);
   assert.ok(left>=0, 'remaining missing');
  }
  for(let i=0;i<5;i++){
   const quiz=bank.makeLocalQuiz(grade,subject,'medium',bank.MIXED_TOPIC_ID,profile);
   if(!quiz.length){report.exhaustionCases++;break;}
   validate(quiz,usedText,grade+':'+subject+':mixed',subject==='math',usedConcepts);
   report.mixedSessions++;report.mixedQuestions+=quiz.length;
   if(subject!=='math'){
    const next=bank.getUnseenQuestionCount(grade,subject,bank.MIXED_TOPIC_ID,profile);
    assert.ok(next>=0);
   }
  }
  // Go back to the first topic after combined practice; never repeat any text.
  const more=bank.makeLocalQuiz(grade,subject,'medium',firstTopic.id,profile);
  validate(more,usedText,firstTopic.id+':after-mixed',subject==='math',usedConcepts);
  report.focusedSessions++;report.focusedQuestions+=more.length;report.crossModeChecks++;
  // No known topic may play a held question, and exhaustion must persist.
  if(subject!=='math') for(const t of topics){
    report.focusedTopicsTested++;
    let seen=new Set(),seenConcept=new Set();
    for(let round=0;round<55;round++){
      const quiz=bank.makeLocalQuiz(grade,subject,'medium',t.id,profile+':focus:'+t.id);
      if(!quiz.length){report.exhaustionCases++;break;}
      validate(quiz,seen,t.id,false,seenConcept);report.focusedSessions++;report.focusedQuestions+=quiz.length;
      if(round===54)throw Error('did not exhaust finite topic '+t.id);
    }
    assert.equal(bank.getUnseenQuestionCount(grade,subject,t.id,profile+':focus:'+t.id),0,'should be exhausted '+t.id);
  }
  report.subjectsTested++;
 }
 // A change of profile must have a fresh history even on the same browser.
 const isolated=bank.getUnseenQuestionCount(1,'arts',bank.MIXED_TOPIC_ID,'fresh-profile-123');
 assert.ok(isolated>=8);
 console.log(JSON.stringify({status:'PASS',...report,profileIsolation:true,browserHistoryPersisted:memory.size>100},null,2));
 fs.writeFileSync(path.join(root,'content','v11-no-repeat-test-result.json'),JSON.stringify({status:'PASS',...report,profileIsolation:true,browserHistoryPersisted:memory.size>100,notes:'Verifies exact text and configured concept gates. Full semantic equivalence still requires separate editorial review.'},null,2)+'\n');
}finally{delete global.window;fs.rmSync(tmp,{recursive:true,force:true});}
