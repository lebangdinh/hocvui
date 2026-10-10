import React, { useEffect, useRef, useState } from 'react';
import { chatWithAI } from '../services/geminiService';
import type { Question, Subject } from '../types';

interface Props {
  question: Question;
  userAnswer: string;
  profileId: string;
  grade: number;
  subject: Subject;
  topicId: string;
}

export function QuestionHelp({ question, userAnswer, profileId, grade, subject, topicId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ai' | 'unavailable'>('idle');
  const [answer, setAnswer] = useState('');
  const [notice, setNotice] = useState('');
  const pending = useRef(false);
  const generation = useRef(0);
  const lastAttempt = useRef(0);
  useEffect(() => () => { generation.current++; }, []);

  const explain = async () => {
    if (pending.current || status === 'ai') return;
    if (Date.now() - lastAttempt.current < 3000) return;
    lastAttempt.current = Date.now();
    pending.current = true;
    const request = ++generation.current;
    setStatus('loading');
    setNotice('');
    try {
      const response = await chatWithAI('Gấu giải thích câu này giúp con nhé.', [], grade, profileId, {
        subject, topicId,
        question: { text: question.text, options: question.options, correctAnswer: question.correctAnswer, explanation: question.explanation },
        userAnswer
      });
      if (request !== generation.current) return;
      if (typeof response !== 'string' || !response.trim()) throw new Error('empty-answer');
      setAnswer(response.slice(0, 2200));
      setStatus('ai');
    } catch (error) {
      if (request !== generation.current) return;
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      setNotice(code.includes('resource-exhausted')
        ? 'Gấu đang giới hạn lượt hỏi. Bé xem lời giải có sẵn và thử lại sau nhé.'
        : 'Chưa kết nối được AI để giải thích thêm. Bé vẫn có thể xem lời giải có sẵn và tiếp tục bài học.');
      setStatus('unavailable');
    } finally {
      if (request === generation.current) pending.current = false;
    }
  };

  return <div className="mt-4 rounded-2xl border border-indigo-200 bg-white p-3 sm:p-4">
    <h5 className="font-bold text-indigo-900">Gấu Nhỏ giúp bé hiểu bài</h5>
    <p className="mt-1 text-xs leading-relaxed text-gray-600">Gấu sẽ xem câu hỏi này, đáp án và lựa chọn của bé để giải thích thêm.</p>
    {status !== 'ai' && <button type="button" disabled={status === 'loading'} onClick={() => { void explain(); }}
      className="mt-3 w-full rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
      {status === 'loading' ? 'Gấu đang xem câu này…' : status === 'unavailable' ? 'Thử kết nối AI lại' : 'Nhờ Gấu giải thích thêm'}
    </button>}
    {status === 'loading' && <p role="status" className="mt-2 text-xs text-gray-500">Bé có thể tiếp tục làm bài trong lúc chờ.</p>}
    {status === 'unavailable' && <div role="status" className="mt-3 text-sm text-gray-700">
      <p>{notice}</p>
      <details className="mt-2 rounded-xl bg-slate-50 p-3">
        <summary className="cursor-pointer font-bold">Lời giải có sẵn · không phải phản hồi AI</summary>
        <p className="mt-2 whitespace-pre-wrap break-words">{question.explanation}</p>
      </details>
    </div>}
    {status === 'ai' && <div role="status" className="mt-3">
      <p className="text-xs font-bold text-indigo-700">Giải thích từ AI</p>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">{answer}</p>
      <p className="mt-2 text-xs text-gray-500">Nếu lời giải khác đáp án trong bài hoặc bé chưa hiểu, hãy nhờ phụ huynh/giáo viên kiểm tra nhé.</p>
    </div>}
  </div>;
}
