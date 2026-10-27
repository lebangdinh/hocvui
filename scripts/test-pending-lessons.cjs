const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const storage = new Map();
const saved = new Set();
let offline = true, writes = 0, failAfterCommit = false, storageDenied = false;
const auth = { currentUser: { uid: 'parent' } };
const localStorage = {
  get length() { return storage.size; }, key: i => [...storage.keys()][i],
  getItem: k => storage.get(k) ?? null,
  setItem: (k,v) => { if (storageDenied) throw Error('quota'); storage.set(k,v); },
  removeItem: k => storage.delete(k)
};
function load() {
  const exports = {};
  const deps = {
    'firebase/firestore': {
      collection: () => 'activities', documentId: () => '__name__',
      where: (f,op,v) => ({f,v}), limit: n => ({n}), query: (...args) => args,
      getDocsFromServer: async args => {
        if (offline) throw Error('offline');
        const id = args.find(x => x.f === '__name__')?.v;
        return { empty: !saved.has(id), size: 0 };
      }
    },
    '../firebase': { auth, db: {} }, './asyncDeadline': { withDeadline: p => p }, '../constants/badges': { BADGES: {} },
    './lessonActivity': { prepareLessonActivity: a => a },
    './progressLedger': { commitStudentLesson: async (a,id) => {
      if (offline) throw Error('offline');
      if (saved.has(id)) throw Error('permission-denied');
      writes++; saved.add(id);
      if (failAfterCommit) { failAfterCommit = false; throw Error('connection lost after commit'); }
      return ['first_lesson'];
    }}
  };
  const js = ts.transpileModule(fs.readFileSync('src/services/pendingLessons.ts','utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }}).outputText;
  vm.runInNewContext(js, { exports, require: k => deps[k], localStorage,
    window: { dispatchEvent() {} }, Event: class {}, CustomEvent: class { constructor(type,options) { this.type=type; this.detail=options?.detail; } }, console });
  return exports;
}
(async () => {
  const a = {userId:'parent',profileId:'child',subject:'math',score:1,totalQuestions:1,grade:1,timestamp:'2026-10-27T00:00:00.000Z'};
  let api = load();
  await assert.rejects(api.saveQueuedLesson(a,'lesson1',10,[]));
  assert.equal(api.pendingLessons('parent').length,1);
  api = load(); // Reload the module/tab, retaining only browser storage.
  auth.currentUser.uid = 'other'; offline = false;
  await api.syncPendingLessons('parent'); assert.equal(writes,0);
  auth.currentUser.uid = 'parent';
  await api.syncPendingLessons('parent');
  assert.equal(writes,1); assert.equal(storage.size,0);
  await api.saveQueuedLesson(a,'lesson1',10,[]); assert.equal(writes,1);
  failAfterCommit = true;
  await api.saveQueuedLesson(a,'lesson2',10,[]);
  assert.equal(writes,2); assert.equal(storage.size,0);
  await Promise.all([api.saveQueuedLesson(a,'lesson3',10,[]),api.saveQueuedLesson(a,'lesson3',10,[])]);
  assert.equal(writes,3);
  storage.set('hocvui.pending.v1.parent.broken', '{broken');
  assert.equal(api.unreadablePendingCount('parent'),1);
  assert.equal(api.pendingLessons('parent').length,0);
  assert.equal(api.unreadablePendingCount('other'),0);
  storage.delete('hocvui.pending.v1.parent.broken');
  storage.set('hocvui.pending.v1.parent.local1',JSON.stringify({activity:a,id:'local1',points:10,badges:[]}));
  storage.set('hocvui.pending.v1.parent.local2',JSON.stringify({activity:{...a,profileId:'sibling'},id:'local2',points:10,badges:[]}));
  api.discardPendingLessons('parent','child');
  assert.equal(api.pendingLessons('parent').length,1);
  api.discardPendingLessons('parent');
  assert.equal(storage.size,0);
  storageDenied = true;
  await assert.rejects(api.saveQueuedLesson(a,'lesson4',10,[]), /bản dự phòng/);
  assert.equal(writes,3);
  console.log('PASS: offline persistence, reload recovery, account isolation, duplicate/concurrent retry, ambiguous commit, corrupt-record visibility, quota error');
})().catch(e => { console.error(e); process.exitCode = 1; });
