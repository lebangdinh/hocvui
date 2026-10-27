/** Authenticated AI services. Provider credentials never ship to the browser. */
import { httpsCallable } from 'firebase/functions';
import type { Subject, Question, Activity } from '../types';
import { auth } from '../firebase';
import { getTopic, getSubjectAvailability } from '../constants/curriculum';
import { functions } from '../firebase';



export async function generateQuestions(
  subject: Subject, grade: number, _history: Activity[] = [],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium', topicId?: string,
  profileId?: string
): Promise<Question[]> {
  if (!auth.currentUser || !profileId) throw new Error('Vui lòng đăng nhập và chọn hồ sơ học sinh.');
  if (!Number.isInteger(grade) || grade < 1 || grade > 5 || getSubjectAvailability(grade, subject) === 'unavailable')
    throw new Error('Lớp và môn không phù hợp.');
  const topic = getTopic(grade, subject, topicId);
  if (!topic) throw new Error('Chưa có chủ đề phù hợp.');
  const call = httpsCallable<{profileId:string;grade:number;subject:Subject;topicId:string;difficulty:string},{questions:Question[]}>(functions, 'generatePracticeQuestions');
  const result = await call({profileId, grade, subject, topicId:topic.id, difficulty});
  return result.data.questions;
}

export interface StudyQuestionContext {
  subject: Subject;
  topicId: string;
  question: Pick<Question, 'text' | 'options' | 'correctAnswer' | 'explanation'>;
  userAnswer: string;
}

export async function chatWithAI(message: string, history: { role:'user'|'model'; parts:{ text:string }[] }[] = [], _grade = 2, profileId?: string, questionContext?: StudyQuestionContext): Promise<string> {
  if (!auth.currentUser || !profileId) throw new Error('Vui lòng đăng nhập và chọn hồ sơ học sinh.');
  const user = auth.currentUser;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const token = await user.getIdToken();
    if (auth.currentUser !== user) throw new Error('Phiên đăng nhập đã thay đổi.');
    const response = await fetch('https://hocvui-gau-nho.lebangdinh.workers.dev/chat', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ profileId, message,
        ...(questionContext ? { questionContext } : {}),
        history: questionContext ? [] : history.slice(-6).map(h => ({role:h.role, text:String(h.parts?.[0]?.text || '').slice(0,500)})) })
    });
    const data = await response.json();
    if (!response.ok) {
      throw Object.assign(new Error(data.error?.message || 'Chưa kết nối được AI.'),
        { code: `functions/${data.error?.code || 'unavailable'}` });
    }
    if (questionContext && data.contextApplied !== true) throw new Error('Máy chủ chưa hỗ trợ giải thích theo câu hỏi.');
    if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('AI chưa trả về nội dung.');
    return data.answer.slice(0, 2200);
  } finally { clearTimeout(timeout); }
}
