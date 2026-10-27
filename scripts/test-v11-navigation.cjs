/* V11: exit-policy unit tests + structural checks for four screen states. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
let ts;
try { ts = require('typescript'); }
catch { ts = require(path.join(require('node:child_process').execFileSync('npm', ['root','-g'], { encoding: 'utf8' }).trim(), 'typescript')); }
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root,'src/services/lessonNavigation.ts'),'utf8');
const compiled = ts.transpileModule(source, {reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
assert.equal(compiled.diagnostics?.length || 0, 0, 'Navigation helper must compile');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(),'hocvui-exit-'));
let checks = 0;
try {
  const out = path.join(tmp,'lessonNavigation.cjs');
  fs.writeFileSync(out,compiled.outputText);
  const {getLessonExitDecision} = require(out);
  const base = {loading:false,hasQuestions:true,finished:false,saveStatus:'idle',isSaving:false};
  for(const destination of ['subject','home']) {
    const incomplete = getLessonExitDecision(base,destination);
    assert.equal(incomplete.blocked,false);
    assert.match(incomplete.confirmation,/chưa hoàn thành sẽ không được tính điểm/);
    assert.match(incomplete.confirmation,destination === 'home' ? /trang chính/ : /màn hình chọn bài/);
    checks++;
    assert.deepEqual(getLessonExitDecision({...base,loading:true},destination),{blocked:false,confirmation:null});checks++;
    assert.deepEqual(getLessonExitDecision({...base,hasQuestions:false},destination),{blocked:false,confirmation:null});checks++;
    assert.deepEqual(getLessonExitDecision({...base,finished:true,saveStatus:'saved'},destination),{blocked:false,confirmation:null});checks++;
    assert.match(getLessonExitDecision({...base,finished:true,saveStatus:'error'},destination).confirmation,/chưa được lưu/);checks++;
    assert.match(getLessonExitDecision({...base,finished:true,saveStatus:'idle'},destination).confirmation,/chưa được lưu/);checks++;
    assert.deepEqual(getLessonExitDecision({...base,saveStatus:'saving'},destination),{blocked:true,confirmation:null});checks++;
    assert.deepEqual(getLessonExitDecision({...base,isSaving:true},destination),{blocked:true,confirmation:null});checks++;
  }
  const lm = fs.readFileSync(path.join(root,'src/components/LearningModule.tsx'),'utf8');
  const app = fs.readFileSync(path.join(root,'src/App.tsx'),'utf8');
  for(const file of ['src/App.tsx','src/components/LearningModule.tsx']) {
    const content = fs.readFileSync(path.join(root,file),'utf8');
    const parsed = ts.transpileModule(content,{fileName:file,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
    assert.equal(parsed.diagnostics?.length || 0,0,`${file} must parse as valid TSX`);checks++;
  }
  assert.equal((lm.match(/\{exitNavigation\}/g)||[]).length,4,'navigation exists on loading, error, finish and question screens');checks++;
  assert.ok(lm.includes("leaveLesson('subject')") && lm.includes("leaveLesson('home')"));checks++;
  assert.ok(lm.includes('disabled={exitLocked}'),'disable nav when results are saving');checks++;
  assert.ok(app.includes("setSelectedSubject(null);") && app.includes("setActiveTab('learn');") && app.includes('onHome={() => {'),'Home button must return to dashboard and learn tab');checks++;
  console.log(JSON.stringify({status:'PASS',checks,renderStates:['loading','error','finished','question'],destinations:['subject','home'],saveGuard:true}));
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
