const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const listeners = new Map();
global.window = {
  addEventListener: (type, f) => { if (!listeners.has(type)) listeners.set(type,new Set()); listeners.get(type).add(f); },
  removeEventListener: (type,f) => listeners.get(type)?.delete(f),
  dispatchEvent: e => listeners.get(e.type)?.forEach(f => f(e)), confirm: () => true
};
let timerCallbacks = new Set();
const realInterval = global.setInterval, realClear = global.clearInterval;
global.setInterval = fn => { timerCallbacks.add(fn); return fn; };
global.clearInterval = fn => timerCallbacks.delete(fn);
const profile = {uid:'parent',id:'kid',grade:1,displayName:'Test',totalPoints:100,badges:[]};
let deductions = 0, resolveHint, quizCount = 0, saveCalls = [], rewardCalls = 0, failReward = false, failSave = false;
const questions = [1,2].map(i => ({id:String(i),text:`Question ${i}`,options:['A','B','C'],correctAnswer:'A',explanation:'Answer A',hint:'Hint A',topic:'Test'}));
const auth = {profile, user:{uid:'parent'},addPoints: () => {deductions++; return new Promise(r=>resolveHint=r);} };
const mocks = {
  'src/AuthContext': {useAuth:()=>auth},
  'src/firebase': {db:{},auth:{currentUser:{uid:'parent'}}},
  'src/services/liveApproval': {useTopicApproval:()=>true},
  'src/services/questionBank': {makeLocalQuiz:()=>{quizCount++;return questions;},hasLocalQuestionBank:()=>true,getPracticeDifficulties:()=>['easy'],resolvePracticeDifficulty:()=> 'easy'},
  'src/services/pendingLessons': {saveQueuedLesson: async (...args) => {saveCalls.push(args);if(failSave)throw Error('offline');return [];}},
  'src/services/progressLedger': {awardGamePoints:async()=>{rewardCalls++;if(failReward)throw Error('offline');}},
  'src/services/geminiService': {},
  'src/services/soundEngine': {playEffect(){},playPraise:()=>false,PRAISES:['Good'],speakExplanation(){},stopSpokenAudio(){}},
  'src/components/QuestionHelp': {QuestionHelp:()=>null},
  'src/components/SoundControls': {SoundControls:()=>null},
  'firebase/firestore': {collection(){},doc:()=>({id:'stable-lesson'})},
  'canvas-confetti': ()=>{},
  'motion/react': {motion:new Proxy({}, {get:(_,tag)=>tag}),AnimatePresence:({children})=>children}
};
const rootDir=process.cwd(), cache=new Map();
function load(file) {
  if(cache.has(file)) return cache.get(file).exports;
  const module = {exports:{}};cache.set(file,module);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const req = name => {
    if(mocks[name])return mocks[name];
    if(name.startsWith('.')) {
      const base=path.resolve(path.dirname(file),name), key=path.relative(rootDir,base).replaceAll('\\','/');
      if(mocks[key])return mocks[key];
      const found=['', '.ts','.tsx','.json'].map(ext=>base+ext).find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
      if(found.endsWith('.json'))return JSON.parse(fs.readFileSync(found));
      return load(found);
    }
    return require(name);
  };
  new Function('require','module','exports',code)(req,module,module.exports);return module.exports;
}
const {LearningModule}=load(path.resolve('src/components/LearningModule.tsx'));
const {GameModule}=load(path.resolve('src/components/GameModule.tsx'));
const flat = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(flat).join(' ') : node ? flat(node.children ?? node.props?.children) : '';
const button = (renderer,text) => renderer.root.findAllByType('button').find(b=>flat(b.props.children).includes(text));
(async()=>{
 let view;
 await act(async()=> {view=create(React.createElement(LearningModule,{subject:'math',grade:1,topicId:'1-math-1',mode:'quiz',onClose(){}}));});
 assert.equal(quizCount,1);
 const hint=button(view,'Gợi ý');assert.ok(hint,'hint button exists');
 await act(async()=>{hint.props.onClick();hint.props.onClick();});
 assert.equal(deductions,1,'double-click must deduct once');
 await act(async()=>{resolveHint();});
 // Timeout locks answers, includes the mistake, and still permits Next.
 const realNow=Date.now;Date.now=()=>realNow()+60000;
 await act(async()=>{for(const tick of [...timerCallbacks])tick();});
 Date.now=realNow;
 const answer=button(view,'B');
 assert.equal(answer.props.disabled,true);
 await act(async()=>{answer.props.onClick();});
 const next=button(view,'Câu tiếp theo');assert.ok(next,'timeout must show Next');
 await act(async()=>{next.props.onClick();next.props.onClick();});
 assert.ok(flat(view.toJSON()).includes('Question 2'),'double Next must not skip second question');
 await act(async()=>{button(view,'A').props.onClick();});
 const finish=button(view,'Hoàn thành') || button(view,'Xem kết quả');assert.ok(finish,'finish exists');
 await act(async()=>{await finish.props.onClick();await finish.props.onClick();});
 assert.equal(saveCalls.length,1);
 assert.equal(saveCalls[0][0].score,1);
 assert.equal(saveCalls[0][0].wrongQuestions.length,1);
 assert.equal(saveCalls[0][0].wrongQuestions[0].userAnswer,'');
 await act(async()=>view.unmount());
 assert.equal(timerCallbacks.size,0,'unmount cleans quiz timer');
 console.log('PASS UI: double hint, timeout, answer lock, double Next, single final save, score/history and timer cleanup');
 failSave=true;
 await act(async()=>{view=create(React.createElement(LearningModule,{subject:'math',grade:1,topicId:'1-math-1',onClose(){}}));});
 await act(async()=>{button(view,'A').props.onClick();});
 await act(async()=>{await button(view,'Câu tiếp theo').props.onClick();});
 await act(async()=>{button(view,'A').props.onClick();});
 await act(async()=>{await (button(view,'Hoàn thành') || button(view,'Xem kết quả')).props.onClick();});
 assert.match(flat(view.toJSON()),/Thử lưu lại/);
 await act(async()=>{window.dispatchEvent({type:'hocvui-lesson-saved',detail:{uid:'other',id:'stable-lesson'}});});
 assert.match(flat(view.toJSON()),/Thử lưu lại/);
 await act(async()=>{window.dispatchEvent({type:'hocvui-lesson-saved',detail:{uid:'parent',id:'stable-lesson'}});});
 assert.match(flat(view.toJSON()),/Đã lưu điểm, cấp và lịch sử/);
 await act(async()=>view.unmount());
 console.log('PASS UI: background sync updates saved status only for the correct account and lesson');
 failReward=true;
 await act(async()=>{view=create(React.createElement(GameModule,{initialGame:'puzzle'}));});
 const start=button(view,'Bắt đầu');assert.ok(start,'star game start');
 await act(async()=>start.props.onClick());
 for(let i=0;i<12;i++)await act(async()=>{view.root.findByProps({'aria-label':'Bắt ngôi sao'}).props.onClick();});
 assert.equal(rewardCalls,1);
 assert.match(flat(view.toJSON()),/Chưa xác nhận lưu sao trò chơi/);
 await act(async()=>view.update(React.createElement(GameModule,{initialGame:'puzzle'})));
 assert.equal(rewardCalls,1,'rerender must not award twice');
 await act(async()=>view.unmount());
 console.log('PASS UI: game award failure is visible; rerender does not duplicate award');
 await act(async()=>{view=create(React.createElement(GameModule,{initialGame:'memory'}));});
 await act(async()=>{button(view,'Bắt đầu chơi').props.onClick();});
 const cards=view.root.findAllByType('button').filter(b=>String(b.props['aria-label']).startsWith('Lật thẻ số'));
 await act(async()=>{cards[0].props.onClick();cards[0].props.onClick();cards[1].props.onClick();cards[2].props.onClick();});
 const visible=view.root.findAllByType('button').filter(b=>String(b.props['aria-label']).startsWith('Hình '));
 assert.equal(visible.length,2,'rapid taps can reveal at most two cards');
 await act(async()=>view.unmount());
 console.log('PASS UI: rapid memory-game taps cannot select a duplicate or third card');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.setInterval=realInterval;global.clearInterval=realClear;});
