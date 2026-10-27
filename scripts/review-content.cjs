const fs=require('node:fs');
const assert=require('node:assert/strict');
const {rel,digest,getQueue,saveQueue}=require('./review-helpers.cjs');
const [,,cmd,topicId,...rest]=process.argv;
const args=Object.fromEntries(rest.filter(x=>x.startsWith('--') && x.includes('=')).map(s=>{const i=s.indexOf('=');return [s.slice(2,i),s.slice(i+1)];}));
const data=getQueue();
const bankHash=digest();
const active=rec=>rec.teacherReview==='approved' && rec.reviewedBankVersion===bankHash && rec.reviewer && rec.reviewDate && rec.reviewEvidence && rec.requiredLearningOutcomeCode && rec.sgkLesson && rec.yccdVerification==='teacher_checked';
if(cmd==='report') {
 const local=data.items.filter(x=>x.questionMode==='local_bank');
 const approved=local.filter(active); const stale=local.filter(x=>x.teacherReview==='approved'&&!active(x));
 console.log(`Chủ đề CTGDPT: ${data.items.length}; có ngân hàng offline: ${local.length}; duyệt hợp lệ: ${approved.length}; duyệt hết hiệu lực: ${stale.length}.`);
 console.log(`TOC SGK ứng viên: ${data.items.filter(x=>x.sgkTocVerification==='external_toc_candidate').length}; Toán đối chiếu YCCĐ sơ bộ: ${data.items.filter(x=>x.yccdVerification==='official_math_subject_checked_partial').length}; chưa có giáo viên xác minh: ${data.items.filter(x=>x.yccdVerification!=='teacher_checked').length}.`);
 process.exit(0);
}
if(!['approve','revoke'].includes(cmd)||!topicId){
 console.log('Sử dụng: node scripts/review-content.cjs report');
 console.log('  node scripts/review-content.cjs approve <topicId> --reviewer="Họ tên giáo viên" --evidence="ID biên bản" --outcome="YCCĐ đã đối chiếu" --outcome-source="URL văn bản nguồn" --lesson="Bài SGK đối chiếu"');
 console.log('  node scripts/review-content.cjs revoke <topicId> --reviewer="Họ tên" --reason="Lý do"');process.exit(1);
}
const item=data.items.find(x=>x.topicId===topicId);
if(!item) throw Error('Không tồn tại chủ đề: '+topicId);
if(cmd==='approve') {
 assert.equal(item.questionMode,'local_bank','Không thể duyệt AI như bộ bài cố định.');
 for(const k of ['reviewer','evidence','outcome','outcome-source','lesson'])assert.ok((args[k]||'').trim().length >= 8, `Thiếu ${k} (ít nhất 8 kí tự)`);
 if(!/^https:\/\//.test(args['outcome-source']))throw Error('Nguồn YCCĐ phải là URL https, cần kiểm tra đối chiếu văn bản chính thức.');
 item.teacherReview='approved';item.reviewer=args.reviewer.trim();item.reviewDate=new Date().toISOString();
 item.reviewEvidence=args.evidence.trim();item.requiredLearningOutcomeCode=args.outcome.trim();item.reviewOutcomeSource=args['outcome-source'].trim();
 item.sgkLesson=args.lesson.trim();item.yccdVerification='teacher_checked';item.reviewedBankVersion=bankHash;item.reviewBankDigest=bankHash;
} else {
 assert.ok((args.reviewer||'').trim().length >= 3,'Thiếu họ tên người thu hồi');
 assert.ok((args.reason||'').trim().length >= 8,'Cần ghi lý do thu hồi');
 item.teacherReview='revoked';item.reviewedBankVersion=null;
}
saveQueue(data);
const audit={at:new Date().toISOString(),action:cmd,topicId,by:args.reviewer,reason:args.reason||null,contentSha256:bankHash};
fs.appendFileSync(rel('content/review-audit-log.jsonl'),JSON.stringify(audit)+'\n');
console.log(`${cmd.toUpperCase()} ${topicId}: đã ghi hồ sơ nội bộ. Người thực hiện chịu trách nhiệm đối chiếu sách và YCCĐ trước khi phát hành.`);
