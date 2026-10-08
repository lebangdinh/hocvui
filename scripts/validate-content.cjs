const assert=require('node:assert/strict');
const fs=require('node:fs');
const {rel,digest,getQueue}=require('./review-helpers.cjs');
const data=getQueue(); const extra=JSON.parse(fs.readFileSync(rel('content/extra-practice-bank.json')));
const f=JSON.parse(fs.readFileSync(rel('content/bank-fingerprint.json')));
assert.equal(f.hash,digest(),'Nội dung có thay đổi: chạy node scripts/build-content-index.cjs trước.');
const topicIds=new Set(); for(const item of data.items){
  assert.ok(!topicIds.has(item.topicId),'Trùng chủ đề '+item.topicId);topicIds.add(item.topicId);
  assert.equal(item.topicId,`${item.grade}-${item.subject}-${item.topicId.split('-').at(-1)}`);
  if(item.teacherReview==='approved') {
    assert.equal(item.reviewedBankVersion,f.hash,'Duyệt đã hết hiệu lực cho '+item.topicId);
    assert.ok(item.questionMode==='local_bank'&&item.reviewer&&item.reviewDate&&item.reviewEvidence&&item.requiredLearningOutcomeCode&&item.reviewOutcomeSource&&item.sgkLesson&&item.yccdVerification==='teacher_checked','Thiếu hồ sơ thẩm định '+item.topicId);
  }
}
const mathOutcomes=data.items.filter(x=>x.subject==='math');
assert.equal(mathOutcomes.length,19,'Số chủ đề Toán bị thay đổi, cần cập nhật danh mục YCCĐ');
for(const row of mathOutcomes) {
 assert.ok(row.yccdVerification==='official_math_subject_checked_partial'||row.yccdVerification==='teacher_checked','Toán thiếu đối chiếu YCCĐ: '+row.topicId);
 assert.ok(row.yccdTextDraft?.length>15 && /^https:\/\//.test(row.yccdEvidence?.url||''),'Toán thiếu YCCĐ hoặc văn bản: '+row.topicId);
}
let questionCount=0;const seenIds=new Set();
for(const topic of extra.topics){
 assert.ok(topicIds.has(topic.topicId),'Chủ đề ngân hàng không có trong CTGDPT: '+topic.topicId);
 assert.ok(topic.items.length>=3,'Quá ít câu hỏi: '+topic.topicId);
 for(const q of topic.items){
  assert.ok(!seenIds.has(q.id),'Trùng câu hỏi '+q.id);seenIds.add(q.id);
  assert.ok(q.text.length>8 && q.explanation.length>=8,'Câu hoặc giải thích quá ngắn '+q.id);
  assert.ok(q.options.length>=3 && q.options.length<=4 && new Set(q.options).size===q.options.length,'Phương án trùng '+q.id);
  assert.equal(q.options.filter(x=>x===q.correctAnswer).length,1,'Đáp án không duy nhất '+q.id);
  questionCount++;
 }
}
console.log(`PASS content: ${data.items.length} chủ đề; ${extra.topics.length} chủ đề mới; ${questionCount} câu tự biên soạn cấu trúc hợp lệ; ${data.items.filter(x=>x.teacherReview==='approved').length} chủ đề đã duyệt.`);
