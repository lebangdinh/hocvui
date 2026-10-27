'use strict';
/** Explainable inventory; suspicious stems are REVIEW FLAGS, NOT automatic rejection. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const bank=require(path.join(root,'content/practice-bank-v11.json'));

const allow=new Set(bank.topics.flatMap(t=>t.items.map(q=>q.id)));
const norm=s=>(s||'').normalize('NFC').toLocaleLowerCase('vi-VN').replace(/\s+/g,' ').trim();
const skeleton=s=>norm(s)
 .replace(/[“”"'‘’]/g,'')
 .replace(/\b\d+(?:[.,]\d+)?\b/g,'{số}')
 .replace(/\b(lan|mai|hoa|nam|bình|an|minh|hà|hùng|linh|huy|ngọc|long)\b/gu,'{tên}')
 .replace(/\s*([?!:;,.])\s*/g,'$1');
const overview=[],flagged=[],nearPairs=[];
let totalAllowed=0,totalHeld=0;
for(const topic of bank.topics){
 const approved=topic.items.filter(q=>allow.has(q.id));
 const held=topic.items.length-approved.length;
 totalAllowed+=approved.length;totalHeld+=held;
 const exact=new Map(),stems=new Map(),concepts=new Set(),skills=new Set();
 const beforeNear=nearPairs.length;
 for(const q of approved){
  const n=norm(q.text),stem=skeleton(q.text);
  if(!exact.has(n))exact.set(n,[]);exact.get(n).push(q.id);
  if(!stems.has(stem))stems.set(stem,[]);stems.get(stem).push(q.id);
  if(q.conceptId)concepts.add(`concept:${q.conceptId}`);
  else if(q.passageId)concepts.add(`passage:${q.passageId}`);
  else if(q.skill?.startsWith('từ-vựng-'))concepts.add(`vocab:${q.skill}`);
  else concepts.add(`text:${n}`);
  skills.add(q.skill||'không gắn nhãn');
 }
 // Similar wording + identical answer is a *potential* excessive task-template
 // repetition, not proof of educational duplication. Keep a bounded sample.
 const tokens=s=>new Set(norm(s).match(/[\p{L}\p{N}]+/gu)||[]);
 const tokenCache=approved.map(q=>tokens(q.text));
 for(let i=0;i<approved.length;i++)for(let j=i+1;j<approved.length;j++){
   if(norm(approved[i].correctAnswer)!==norm(approved[j].correctAnswer))continue;
   const a=tokenCache[i],b=tokenCache[j];
   if(a.size<4||b.size<4)continue;
   const common=[...a].filter(x=>b.has(x)).length,sim=common/(a.size+b.size-common);
   if(sim>=0.70)nearPairs.push({topicId:topic.topicId,firstId:approved[i].id,secondId:approved[j].id,similarity:Number(sim.toFixed(3)),reason:'câu cùng đáp án và rất giống cấu trúc – KHÔNG kết luận là câu trùng'});
 }
 for(const [stem,ids] of stems)if(ids.length>1){
  flagged.push({topicId:topic.topicId,reason:'cùng khuôn câu hỏi – cần kiểm tra kiến thức đích',count:ids.length,ids:ids.slice(0,12),example:stem.slice(0,130)});
 }
 overview.push({topicId:topic.topicId,grade:topic.grade,subject:topic.subject,source:topic.items.length,aiEnabled:approved.length,held,distinctExact:exact.size,distinctTaggedConcepts:concepts.size,skillLabels:skills.size,templateClusters:[...stems.values()].filter(g=>g.length>1).length,nearDuplicatePairs:nearPairs.length-beforeNear,exactDuplicateGroups:[...exact.values()].filter(g=>g.length>1).length});
}
const report={version:'V11',approval:'AI sơ tuyển, không có chứng nhận giáo viên',method:'exact NFC + nhóm concept/passage + mẫu câu chuẩn hóa số và tên; nhóm cùng khuôn chỉ được cảnh báo, KHÔNG tự động loại',topicCount:bank.topics.length,sourceQuestions:totalAllowed+totalHeld,aiEnabled:totalAllowed,held:totalHeld,totalTemplateSuspectGroups:flagged.length,totalNearDuplicatePairs:nearPairs.length,topics:overview,templateSuspects:flagged,similarityAlerts:nearPairs.slice(0,1000)};
const out=path.join(root,'content');
fs.writeFileSync(path.join(out,'v11-quality-audit.json'),JSON.stringify(report,null,2)+'\n');
const rows=['topicId,grade,subject,source,aiEnabled,held,distinctExact,distinctTaggedConcepts,skillLabels,templateClusters,nearDuplicatePairs,exactDuplicateGroups'];
for(const o of overview)rows.push(['topicId','grade','subject','source','aiEnabled','held','distinctExact','distinctTaggedConcepts','skillLabels','templateClusters','nearDuplicatePairs','exactDuplicateGroups'].map(k=>o[k]).join(','));
fs.writeFileSync(path.join(out,'v11-topic-inventory.csv'),rows.join('\n')+'\n');
console.log(`V11 audit: ${overview.length} topics, ${totalAllowed} enabled, ${totalHeld} held; ${flagged.length} same-stem clusters, ${nearPairs.length} similar-wording pairs for editorial review.`);
