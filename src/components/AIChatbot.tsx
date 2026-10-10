import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, MessageCircle, Send, X, Minimize2, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithAI } from '../services/geminiService';
import { getLocalStudyReply, unavailableAIMessage } from '../services/localStudyBear';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

type Message = {
  role: 'user' | 'model';
  content: string;
  source?: 'local' | 'ai' | 'status';
};

type ChatTurn = { role: 'user' | 'model'; parts: { text: string }[] };
type AIStatus = 'idle' | 'offline' | 'checking' | 'online';

const WELCOME: Message = {
  role: 'model',
  source: 'local',
  content: 'Chào bé! 🐻💛 Gấu giúp bé chào hỏi, làm phép tính đơn giản và tìm bài học nhé. Bé cứ nhập câu hỏi, Gấu sẽ giúp bé tìm hiểu bài nhé.'
};

export const AIChatbot: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Only a real authenticated AI reply confirms the connection.
  // Only show "online" after a successful real backend response.
  const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const verifiedHistoryRef = useRef<ChatTurn[]>([]);
  const pendingRef = useRef(false);
  const generationRef = useRef(0);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isOpen, messages, isLoading]);

  // Conversations never cross student profiles.
  useEffect(() => {
    generationRef.current++;
    setIsLoading(false);
    pendingRef.current = false;
    setMessages([WELCOME]);
    setInput('');
    setAiStatus('idle');
    setConnectionMessage('');
    verifiedHistoryRef.current = [];
    return () => { generationRef.current++; };
  }, [profile?.uid, profile?.id]);

  const append = (content: string, source: Message['source'] = 'local') =>
    setMessages(prev => [...prev, { role: 'model', content, source }]);

  const sendMessage = async (text: string) => {
    const message = text.trim().slice(0, 500);
    if (!message || pendingRef.current) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    const localReply = getLocalStudyReply(message, profile?.grade || 2);
    if (localReply) {
      append(localReply.text);
      return;
    }

    if (!profile?.id) {
      append('Gấu chưa thấy hồ sơ học sinh. Bé chọn hồ sơ rồi thử lại nhé!', 'status');
      return;
    }

    pendingRef.current = true;
    setIsLoading(true);
    setAiStatus('checking');
    setConnectionMessage('');
    const generation = generationRef.current;
    try {
      const history = verifiedHistoryRef.current.slice(-6);
      const answer = await chatWithAI(message, history, profile.grade, profile.id);
      if (generation !== generationRef.current) return;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('empty-ai-answer');
      const userTurn: ChatTurn = { role: 'user', parts: [{ text: message }] };
      const modelTurn: ChatTurn = { role: 'model', parts: [{ text: answer.slice(0, 500) }] };
      verifiedHistoryRef.current = [...history, userTurn, modelTurn].slice(-6);
      setAiStatus('online');
      append(answer.slice(0, 2200), 'ai');
    } catch (error) {
      if (generation !== generationRef.current) return;
      console.warn('Gấu Nhỏ AI unavailable:', error);
      setAiStatus('offline');
      setConnectionMessage('Kết nối AI bị gián đoạn. Bé vẫn có thể hỏi những câu cơ bản.');
      append(unavailableAIMessage(), 'status');
    } finally {
      if (generation === generationRef.current) {
        pendingRef.current = false;
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-3 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="Gấu Nhỏ hỗ trợ học tập"
            initial={{ opacity: 0, y: 16, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: .97 }}
            className="mb-3 flex h-[min(76dvh,720px)] w-[calc(100vw-24px)] max-w-[540px] flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_22px_65px_rgba(20,45,88,.25)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white sm:px-5 sm:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <Bot size={24} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black sm:text-lg">Gấu Nhỏ – bạn học của bé</h3>
                  <p className="mt-0.5 text-[11px] font-medium text-white/90 sm:text-xs">
                    <span className={cn('mr-1.5 inline-block h-2 w-2 rounded-full',
                      aiStatus === 'online' ? 'bg-emerald-300' : aiStatus === 'checking' ? 'bg-amber-300' : 'bg-white/60')} />
                    {aiStatus === 'online' ? 'AI đã kết nối' : aiStatus === 'checking' ? 'Đang hỏi AI…' : aiStatus === 'offline' ? 'AI tạm thời chưa kết nối' : 'Gấu sẵn sàng nhận câu hỏi'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" aria-label="Thu nhỏ trò chuyện" onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 hover:bg-white/15"><Minimize2 size={20} /></button>
                <button type="button" aria-label="Đóng trò chuyện" onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 hover:bg-white/15"><X size={22} /></button>
              </div>
            </div>

            {connectionMessage && <p role="status" className="shrink-0 bg-sky-50 px-4 py-2 text-[11px] text-slate-600">{connectionMessage}</p>}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-3 py-4 sm:px-5" aria-live="polite">
              {messages.map((msg, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className={cn('flex max-w-[96%] items-start gap-2.5',
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm',
                    msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600')}>
                    {msg.role === 'user' ? <User size={17} /> : <Bot size={17} />}
                  </span>
                  <div className={cn('min-w-0 max-w-[calc(100%-42px)] rounded-2xl px-3.5 py-3 text-sm leading-relaxed shadow-sm sm:px-4 sm:text-base',
                    msg.role === 'user' ? 'rounded-tr-sm bg-blue-600 text-white'
                      : 'rounded-tl-sm border border-slate-100 bg-white text-slate-800')}>
                    <div className={cn("prose prose-sm max-w-none break-words prose-p:my-1 prose-p:leading-relaxed sm:prose-base", msg.role === 'user' && "prose-invert")}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div role="status" className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 size={17} className="animate-spin" /> Gấu đang kiểm tra câu trả lời…
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-3 sm:px-5">
              <div className="mb-2 flex flex-wrap gap-2">
                {['Chào gấu', '2 + 3 bằng bao nhiêu?', 'Làm sao học tốt'].map(prompt => (
                  <button type="button" key={prompt} disabled={isLoading || aiStatus === 'checking'}
                    onClick={() => { void sendMessage(prompt); }}
                    className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                    {prompt}
                  </button>
                ))}
              </div>
              <form className="flex items-center gap-2"
                onSubmit={e => { e.preventDefault(); void sendMessage(input); }}>
                <input type="text" value={input} maxLength={500} autoComplete="off"
                  onChange={e => setInput(e.target.value)}
                  placeholder="Bé muốn hỏi Gấu điều gì?"
                  aria-label="Nhập câu hỏi cho Gấu Nhỏ"
                  className="min-w-0 flex-1 rounded-xl border border-sky-200 bg-slate-50 px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-base"/>
                <button type="submit" aria-label="Gửi câu hỏi"
                  disabled={!input.trim() || isLoading || aiStatus === 'checking'}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                  <Send size={19} />
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-slate-500 sm:text-xs">
                Câu hỏi được gửi đến Cloudflare AI (Llama). Bé đừng gửi thông tin riêng tư nhé. AI có thể trả lời sai.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: .95 }}
        type="button" aria-label={isOpen ? 'Đóng Gấu Nhỏ' : 'Mở Gấu Nhỏ hỗ trợ học tập'}
        onClick={() => setIsOpen(v => !v)}
        className={cn('relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl',
          isOpen ? 'bg-slate-500' : 'bg-gradient-to-tr from-blue-500 to-indigo-600')}>
        {isOpen ? <X size={24} /> : <MessageCircle size={25} />}
        {!isOpen && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-yellow-400 p-1 text-xs">★</span>}
      </motion.button>
    </div>
  );
};
