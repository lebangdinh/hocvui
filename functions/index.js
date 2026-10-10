'use strict';
/** Học Vui V4. No Gemini secret is ever returned to the browser. */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { GoogleGenAI, Type } = require('@google/genai');
const alignment = require('./content/alignment-review-queue.json');
const fingerprint = require('./content/bank-fingerprint.json');
const { validateStudyQuestion, questionInstruction } = require('./studyQuestion.cjs');
const extraBankIds = require('./content/extra-bank-topic-ids.json');

const app = initializeApp();
const db = getFirestore(app);
const geminiKey = defineSecret('GEMINI_API_KEY');
const region = 'asia-southeast1';
const opts = { region, secrets: [geminiKey], timeoutSeconds: 45, memory: '512MiB', maxInstances: 8 };
const reviewOpts = { region, timeoutSeconds: 30, memory: '256MiB', maxInstances: 4 };
const str = (v, max = 100) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
const roles = ['admin', 'reviewer'];
const allowedSubjects = new Set(['math','vietnamese','english','ethics','nature','science','history_geo','it','physical','arts','experiential']);

function signedIn(req) {
  if (!req.auth?.uid) throw new HttpsError('unauthenticated', 'Vui lòng đăng nhập Google.');
  return req.auth.uid;
}
function staff(req) {
  signedIn(req);
  if (!roles.includes(req.auth.token.role)) throw new HttpsError('permission-denied', 'Chỉ người duyệt được cấp quyền mới sử dụng được.');
}
function getTopic(grade, subject, topicId) {
  if (!Number.isInteger(grade) || grade < 1 || grade > 5 || !allowedSubjects.has(subject) || !str(topicId, 100)) {
    throw new HttpsError('invalid-argument', 'Môn, lớp hoặc chủ đề không hợp lệ.');
  }
  const topic = alignment.items.find(x => x.grade === grade && x.subject === subject && x.topicId === topicId);
  if (!topic) throw new HttpsError('invalid-argument', 'Không tìm thấy chủ đề phù hợp.');
  return topic;
}
async function ownedProfile(uid, profileId) {
  if (!str(profileId, 128)) throw new HttpsError('invalid-argument', 'Hồ sơ học sinh không hợp lệ.');
  const snap = await db.doc(`users/${uid}/profiles/${profileId}`).get();
  if (!snap.exists || snap.data().uid !== uid || !Number.isInteger(snap.data().grade)) {
    throw new HttpsError('permission-denied', 'Không có quyền dùng hồ sơ này.');
  }
  return snap.data();
}
async function quota(uid, action, perDay, minSpacingMs) {
  const ref = db.doc(`privateRateLimits/${uid}_${action}`);
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  await db.runTransaction(async transaction => {
    const s = await transaction.get(ref);
    const old = s.exists ? s.data() : {};
    const count = old.day === day ? Number(old.count) || 0 : 0;
    if (old.day === day && now - Number(old.lastAt || 0) < minSpacingMs) {
      throw new HttpsError('resource-exhausted', 'Thao tác quá nhanh. Vui lòng đợi một chút.');
    }
    if (count >= perDay) throw new HttpsError('resource-exhausted', 'Đã đạt giới hạn AI hôm nay. Bé có thể luyện với bài soạn sẵn.');
    transaction.set(ref, { day, count: count + 1, lastAt: now, updatedAt: FieldValue.serverTimestamp() });
  });
}
function getAI() {
  const key = geminiKey.value();
  if (!key) throw new HttpsError('failed-precondition', 'Máy chủ chưa cấu hình Gemini.');
  return new GoogleGenAI({ apiKey: key });
}
function cleanQuestions(raw, topicName) {
  let data;
  try { data = JSON.parse(raw || ''); } catch { throw new HttpsError('internal', 'Phản hồi AI không đúng định dạng.'); }
  if (!Array.isArray(data) || data.length !== 5) throw new HttpsError('internal', 'AI tạo sai số lượng câu hỏi.');
  return data.map((q, i) => {
    if (!str(q?.text, 500) || !Array.isArray(q.options) || q.options.length !== 4 ||
        !q.options.every(o => str(o, 150)) || new Set(q.options).size !== 4 ||
        !q.options.includes(q.correctAnswer) || !str(q.explanation, 800)) {
      throw new HttpsError('internal', `Câu hỏi AI số ${i + 1} chưa đạt kiểm tra hình thức.`);
    }
    return { id: `ai-${i + 1}`, text: q.text, options: q.options,
      correctAnswer: q.correctAnswer, explanation: q.explanation,
      topic: topicName, hint: typeof q.hint === 'string' ? q.hint.slice(0, 250) : '' };
  });
}
const qSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
  text: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } },
  correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, hint: { type: Type.STRING }
}, required: ['text','options','correctAnswer','explanation','hint'] } };

exports.generatePracticeQuestions = onCall(opts, async req => {
  const uid = signedIn(req);
  const { profileId, grade, subject, topicId, difficulty = 'medium' } = req.data || {};
  if (!['easy','medium','hard'].includes(difficulty)) throw new HttpsError('invalid-argument', 'Độ khó không hợp lệ.');
  const profile = await ownedProfile(uid, profileId);
  if (profile.grade !== grade) throw new HttpsError('permission-denied', 'Lớp học khác hồ sơ học sinh.');
  const topic = getTopic(grade, subject, topicId);
  await quota(uid, 'generate', 15, 5000);
  const prompt = `Bạn là giáo viên tiểu học tại Việt Nam. Tạo CHÍNH XÁC 5 câu trắc nghiệm riêng biệt cho học sinh lớp ${grade}, môn ${subject}, chủ đề: ${topic.topicName}. Giới hạn: ${topic.scope}. Độ khó ${difficulty}. Bám chuẩn GDPT 2018; tham chiếu Kết nối tri thức với cuộc sống năm 2026–2027, không khẳng định trùng từng bài sách. Mỗi câu có đúng 4 lựa chọn phân biệt và duy nhất 1 đáp án đúng, câu giải thích ngắn, dễ hiểu. Không sao chép nguyên văn dài từ SGK. Không thu thập thông tin cá nhân. Đối với kỹ năng vận động/nghệ thuật chỉ kiểm tra kiến thức nhận biết, không thay cho hoạt động thực hành. Trả JSON theo cấu trúc yêu cầu.`;
  try {
    const response = await getAI().models.generateContent({model: 'gemini-2.5-flash',contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: qSchema, temperature: 0.4 } });
    return { questions: cleanQuestions(response.text, topic.topicName), reviewStatus: 'ai_unverified' };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error('Gemini generation error', e?.message || e);
    throw new HttpsError('unavailable', 'Tạm thời không tạo được câu hỏi. Bé có thể chọn bài soạn sẵn.');
  }
});

exports.askStudyBear = onCall(opts, async req => {
  const uid = signedIn(req);
  const { profileId, message, history = [], questionContext } = req.data || {};
  const profile = await ownedProfile(uid, profileId);
  if (profile.deletedAt || profile.grade < 1 || profile.grade > 5) {
    throw new HttpsError('permission-denied', 'Hồ sơ không còn khả dụng để hỏi bài.');
  }
  if (!str(message, 500) || !Array.isArray(history) || history.length > 6) {
    throw new HttpsError('invalid-argument', 'Nội dung trò chuyện quá dài hoặc không hợp lệ.');
  }
  const safeHistory = history.map(x => {
    if (!['user','model'].includes(x?.role) || !str(x?.text, 500)) throw new HttpsError('invalid-argument', 'Lịch sử trò chuyện không hợp lệ.');
    return {role:x.role,parts:[{text:x.text}]};
  });
  const exercise = questionContext === undefined ? null : validateStudyQuestion(questionContext, profile.grade, getTopic);
  // Contextual explanations are single-turn: no unrelated conversation or child history.
  if (exercise && history.length) throw new HttpsError('invalid-argument', 'Giải thích câu sai không dùng lịch sử trò chuyện.');
  await quota(uid, 'chat', 40, 2500);
  try {
    const chat = getAI().chats.create({model:'gemini-2.5-flash', history:safeHistory,
      config:{maxOutputTokens: 900, temperature: 0.3, systemInstruction:`Bạn là Gấu Nhỏ Thông Thái, trợ lý học tập dành cho học sinh tiểu học Việt Nam lớp ${profile.grade}. Câu trả lời tích cực, dễ hiểu, ngắn gọn và phù hợp độ tuổi. Không yêu cầu bé cung cấp tên đầy đủ, địa chỉ, số điện thoại hay thông tin cá nhân. Nếu bé gặp nguy hiểm, khuyến khích tìm cha mẹ hoặc thầy cô. Không tự nhận nội dung AI là đáp án đã được thẩm định. ${exercise ? questionInstruction : ''}`}});
    const response = await chat.sendMessage({message: exercise
      ? `Giải thích câu sai dưới đây. Dữ liệu tham khảo JSON:\n${JSON.stringify(exercise)}`
      : message});
    const answer = String(response.text || '').slice(0, 2200);
    if (!answer) throw Error('empty answer');
    return { answer, reviewStatus:'ai_unverified', contextApplied: !!exercise };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error('Study bear error', e?.message || e);
    throw new HttpsError('unavailable', 'Gấu Nhỏ đang bận. Bé thử lại sau nhé.');
  }
});

// Published review is owned by backend and invalidated when bank/curriculum changes.
exports.reviewCurriculumTopic = onCall(reviewOpts, async req => {
  staff(req);
  const { topicId, action, reviewerName, evidenceId, evidenceUrl, lesson, learningOutcome, outcomeSource, reviewChecklist, reason } = req.data || {};
  const topic = alignment.items.find(x => x.topicId === topicId);
  if (!topic) throw new HttpsError('invalid-argument', 'Mã chủ đề không tồn tại.');
  if (!['approve', 'revoke'].includes(action)) throw new HttpsError('invalid-argument', 'Thao tác không hợp lệ.');
  if (action === 'approve') {
    if (topic.questionMode !== 'local_bank' || !str(reviewerName, 100) || !str(evidenceId, 150) ||
        !str(lesson, 180) || !str(learningOutcome, 500) || !str(outcomeSource, 500) ||
        !str(evidenceUrl, 600) || !/^https:\/\//.test(evidenceUrl) ||
        !reviewChecklist || reviewChecklist.eachQuestionChecked !== true ||
        reviewChecklist.answersVerified !== true || reviewChecklist.curriculumMatched !== true ||
        !/^https:\/\//.test(outcomeSource)) {
      throw new HttpsError('invalid-argument', 'Chỉ duyệt ngân hàng câu hỏi có đầy đủ hồ sơ và nguồn đối chiếu HTTPS.');
    }
  } else if (!str(reason, 400)) throw new HttpsError('invalid-argument', 'Cần ghi lý do thu hồi.');
  const ref = db.doc(`contentApprovals/${topicId}`);
  const log = db.collection('contentReviewAudit').doc();
  await db.runTransaction(async tx => {
    const last = await tx.get(ref);
    const next = action === 'approve' ? { status:'approved', topicId, grade:topic.grade, subject:topic.subject,
      fingerprint:fingerprint.hash, reviewedBy:req.auth.uid, reviewerName, evidenceId, evidenceUrl, reviewChecklist, lesson,
      learningOutcome, outcomeSource, reviewedAt: FieldValue.serverTimestamp() }
      : { status:'revoked', topicId, fingerprint:fingerprint.hash, revokedBy:req.auth.uid,
          revokedAt:FieldValue.serverTimestamp(), reason };
    tx.set(ref, next);
    tx.set(log, {topicId,action,actorUid:req.auth.uid,actorRole:req.auth.token.role,
      before:last.exists ? last.data() : null, after:next, at:FieldValue.serverTimestamp()});
  });
  return {ok:true, topicId, action, fingerprint:fingerprint.hash};
});

// Privacy: authenticated parent can actually erase their child data or account.
// This operation bypasses client-side Firestore query limitations using Admin SDK.
async function removeActivities(uid, profileId) {
  // Read indexed by userId, then delete only matching profile if provided.
  const docs = await db.collection('activities').where('userId','==',uid).get();
  const batchSize = 200;
  const refs = docs.docs.filter(d=>!profileId || d.data().profileId === profileId).map(d=>d.ref);
  for (let i=0;i<refs.length;i+=batchSize) {
    const batch = db.batch();
    refs.slice(i,i+batchSize).forEach(ref=>batch.delete(ref));
    await batch.commit();
  }
}
exports.deleteChildProfile = onCall(reviewOpts, async req => {
  const uid=signedIn(req);
  const {profileId}=req.data||{};
  await ownedProfile(uid,profileId);
  await removeActivities(uid,profileId);
  await db.doc(`users/${uid}/profiles/${profileId}`).delete();
  return {ok:true};
});
exports.deleteMyAccount = onCall(reviewOpts, async req => {
  const uid=signedIn(req);
  await removeActivities(uid);
  await db.recursiveDelete(db.doc(`users/${uid}`));
  await Promise.all([
    db.doc(`privateRateLimits/${uid}_generate`).delete(),
    db.doc(`privateRateLimits/${uid}_chat`).delete(),
  ]);
  const { getAuth }=require('firebase-admin/auth');
  await getAuth(app).deleteUser(uid);
  return {ok:true};
});
