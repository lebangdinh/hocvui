'use strict';
/** Offline server-behavior unit tests with mocked Firebase SDK; NOT an emulator or live Firebase test. */
const assert=require('node:assert/strict');
const Module=require('node:module');
const path=require('node:path');
const memory=new Map();let id=0;let geminiCalls=0;const deletedUsers=[];
const clone=obj=> obj===undefined ? undefined : JSON.parse(JSON.stringify(obj));
function ref(k){return {path:k, get:async()=>snap(k),set:async d=>memory.set(k,clone(d)),delete:async()=>memory.delete(k)};}
function snap(k){return {exists:memory.has(k),data:()=>clone(memory.get(k)),ref:ref(k)};}
const db={
 doc:k=>ref(k),
 collection:k=>({
  doc:()=>ref(`${k}/generated-${++id}`),
  where(field,op,val){assert.equal(op,'==');return {get:async()=>({docs:[...memory].filter(([p,v])=>p.startsWith(`${k}/`)&&v?.[field]===val).map(([p,v])=>({data:()=>clone(v),ref:ref(p)}))})}},
 }),
 async runTransaction(fn){return fn({get:async r=>snap(r.path),set:(r,d)=>memory.set(r.path,clone(d))});},
 batch(){const refs=[];return {delete:r=>refs.push(r.path),commit:async()=>refs.forEach(k=>memory.delete(k))}},
 async recursiveDelete(r){for(const k of memory.keys())if(k===r.path||k.startsWith(`${r.path}/`))memory.delete(k)}
};
class HttpsError extends Error{constructor(code,msg){super(msg);this.code=code;}}
const questions=Array.from({length:5},(_,i)=>({text:`Câu số ${i+1} có đáp án nào đúng?`,options:['A','B','C','D'],correctAnswer:'A',explanation:'Đáp án chính xác là A.',hint:'Hãy chọn A.'}));
const googleMock=class GoogleGenAI {
 constructor(o){assert.equal(o.apiKey,'FAKE_ONLY_IN_TEST');this.models={generateContent:async()=>{geminiCalls++;return {text:JSON.stringify(questions)}}};this.chats={create:()=>({sendMessage:async()=>({text:'Chào bé, cùng học nhé!'})})};}
};
const stubs={
 'firebase-functions/v2/https':{onCall:(_opts,fn)=>fn,HttpsError},
 'firebase-functions/params':{defineSecret:()=>({value:()=> 'FAKE_ONLY_IN_TEST'})},
 'firebase-admin/app':{initializeApp:()=>({isMock:true})},
 'firebase-admin/firestore':{getFirestore:()=>db,FieldValue:{serverTimestamp:()=>({_type:'timestamp'})}},
 'firebase-admin/auth':{getAuth:()=>({deleteUser:async uid=>deletedUsers.push(uid)})},
 '@google/genai':{GoogleGenAI:googleMock,Type:{ARRAY:'ARRAY',OBJECT:'OBJECT',STRING:'STRING'}}
};
const orig=Module._load;
let functions;
try {Module._load=function(req,parent,isMain){return Object.hasOwn(stubs,req)?stubs[req]:orig.call(this,req,parent,isMain)};
 functions=require(path.resolve(__dirname,'../functions/index.js'));
}finally{ /* kept active for nested runtime imports; restored after tests */ }
const a={auth:{uid:'parent-a',token:{}},data:{}};
const reviewer={auth:{uid:'editor',token:{role:'reviewer'}},data:{}};
const admin={auth:{uid:'chief',token:{role:'admin'}},data:{}};
const withData=(req,data)=>({...req,data});
async function hasCode(p,code){await assert.rejects(p,e=>e instanceof HttpsError && e.code===code)}
(async()=>{
 const profile={uid:'parent-a',id:'kid-one',displayName:'Bé A',grade:1};
 memory.set('users/parent-a/profiles/kid-one',profile);
 await hasCode(functions.askStudyBear({data:{profileId:'kid-one',message:'Xin chào'}}),'unauthenticated');
 await hasCode(functions.askStudyBear(withData({auth:{uid:'parent-b',token:{}}},{profileId:'kid-one',message:'Xin chào'})),'permission-denied');
 await hasCode(functions.generatePracticeQuestions(withData(a,{profileId:'kid-one',grade:5,subject:'math',topicId:'5-math-1'})),'permission-denied');
 await hasCode(functions.generatePracticeQuestions(withData(a,{profileId:'kid-one',grade:1,subject:'math',topicId:'BAD'})),'invalid-argument');
 const review={topicId:'1-math-1',action:'approve',reviewerName:'Giáo viên kiểm tra',evidenceId:'hoso-2026-001',evidenceUrl:'https://example.edu.vn/kiemduyet/001',lesson:'So sánh các số',learningOutcome:'So sánh các số trong phạm vi lớp 1',outcomeSource:'https://example.edu.vn/chuongtrinh',reviewChecklist:{eachQuestionChecked:true,answersVerified:true,curriculumMatched:true}};
 await hasCode(functions.reviewCurriculumTopic(withData(a,review)),'permission-denied');
 await hasCode(functions.reviewCurriculumTopic(withData(reviewer,{...review,reviewChecklist:{...review.reviewChecklist,answersVerified:false}})),'invalid-argument');
 await functions.reviewCurriculumTopic(withData(reviewer,review));
 assert.equal(memory.get('contentApprovals/1-math-1').status,'approved');
 assert.equal(memory.get('contentApprovals/1-math-1').reviewedBy,'editor');
 assert.equal(memory.get('contentApprovals/1-math-1').reviewChecklist.answersVerified,true);
 await functions.reviewCurriculumTopic(withData(admin,{topicId:'1-math-1',action:'revoke',reason:'Cần thẩm định lại.'}));
 assert.equal(memory.get('contentApprovals/1-math-1').status,'revoked');
 assert.equal([...memory.keys()].filter(k=>k.startsWith('contentReviewAudit/')).length,2);
 const clock=Date.now;let now=2000000000000;Date.now=()=>now;
 try{
  for(let j=0;j<15;j++){const out=await functions.generatePracticeQuestions(withData(a,{profileId:'kid-one',grade:1,subject:'math',topicId:'1-math-1'}));assert.equal(out.questions.length,5);assert.equal(out.reviewStatus,'ai_unverified');now+=6000}
  await hasCode(functions.generatePracticeQuestions(withData(a,{profileId:'kid-one',grade:1,subject:'math',topicId:'1-math-1'})),'resource-exhausted');
 }finally{Date.now=clock}
 assert.equal(geminiCalls,15,'Exactly 15 Gemini calls permitted per day');
 memory.set('activities/a1',{userId:'parent-a',profileId:'kid-one',subject:'math'});
 memory.set('activities/b1',{userId:'parent-b',profileId:'other',subject:'math'});
 await hasCode(functions.deleteChildProfile(withData({auth:{uid:'parent-b',token:{}}},{profileId:'kid-one'})),'permission-denied');
 await functions.deleteChildProfile(withData(a,{profileId:'kid-one'}));
 assert.ok(!memory.has('users/parent-a/profiles/kid-one'));
 assert.ok(!memory.has('activities/a1'));
 assert.ok(memory.has('activities/b1'));
 memory.set('users/parent-a/profiles/child2',{...profile,id:'child2'});
 memory.set('activities/a2',{userId:'parent-a',profileId:'child2'});
 await functions.deleteMyAccount(withData(a,{}));
 assert.ok(!memory.has('users/parent-a/profiles/child2'));
 assert.ok(!memory.has('activities/a2'));
 assert.deepEqual(deletedUsers,['parent-a']);
 console.log('PASS mocked callables: unauthenticated/other-parent rejected; mismatched grade/topic rejected; staff checklist + audit + revoke; quota 15/day; child/account deletion scoped by owner.');
 console.log('NOTE: Đây là test với Firebase giả lập bằng mock, không phải Firebase Emulator Suite hoặc Firebase thật.');
})().catch(err=>{console.error('FAIL mocked callable tests',err);process.exitCode=1}).finally(()=>{Module._load=orig});
