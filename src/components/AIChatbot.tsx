import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Sparkles, 
  Loader2,
  User,
  Bot
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithAI } from '../services/geminiService';
import { cn } from '../lib/utils';
import { useAuth } from '../AuthContext';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AIChatbot: React.FC = () => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: 'Chào bé! Gấu Nhỏ Thông Thái đây! Bé có câu hỏi gì về bài học hôm nay hay cần Gấu Nhỏ giúp gì không nào? 🐻✨' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const aiResponse = await chatWithAI(userMessage, history, profile?.grade || 2, profile?.id);
      setMessages(prev => [...prev, { role: 'model', content: aiResponse || 'Gấu Nhỏ đang suy nghĩ một chút, bé hỏi lại nhé!' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: 'Ôi, Gấu Nhỏ bị hắt xì một cái nên quên mất rồi. Bé thử lại giúp Gấu Nhỏ nhé! 🍯' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[90vw] sm:w-[550px] h-[75vh] sm:h-[750px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-blue-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex items-center justify-between text-white shadow-lg">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <Bot size={36} />
                </div>
                <div>
                  <h3 className="font-black text-2xl">Gấu Nhỏ Thông Thái</h3>
                  <div className="flex items-center gap-2 text-sm font-bold opacity-90">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                    Đang sẵn sàng giúp bé!
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Minimize2 size={28} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-4 max-w-[92%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                    msg.role === 'user' ? "bg-blue-100 text-blue-600" : "bg-indigo-100 text-indigo-600"
                  )}>
                    {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
                  </div>
                  <div className={cn(
                    "p-5 rounded-3xl text-xl leading-relaxed shadow-md",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  )}>
                    <div className="prose prose-lg max-w-none prose-p:leading-relaxed prose-p:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-4 mr-auto max-w-[90%]">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Bot size={24} />
                  </div>
                  <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-100 shadow-md">
                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative flex items-center gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Hỏi Gấu Nhỏ gì đó đi bé..."
                  className="flex-1 bg-slate-100 border-2 border-transparent rounded-2xl px-6 py-5 text-xl font-bold focus:ring-4 focus:ring-blue-400 focus:bg-white transition-all outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-5 rounded-2xl transition-all shadow-xl",
                    input.trim() && !isLoading 
                      ? "bg-blue-600 text-white shadow-blue-200 hover:scale-105 active:scale-95" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Send size={28} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center font-medium italic">
                Gấu Nhỏ có thể nhầm lẫn một chút, bé hãy hỏi ba mẹ nếu không chắc nhé! 🐻❤️
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all relative group",
          isOpen 
            ? "bg-slate-200 text-slate-600" 
            : "bg-gradient-to-tr from-blue-500 to-indigo-600 text-white"
        )}
      >
        {isOpen ? <X size={28} /> : (
          <>
            <MessageCircle size={28} />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-lg"
            >
              <Sparkles size={12} className="text-white" />
            </motion.div>
          </>
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-20 bg-white px-4 py-2 rounded-2xl shadow-xl border border-blue-50 text-blue-600 font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Hỏi Gấu Nhỏ nè! 🐻👋
          </div>
        )}
      </motion.button>
    </div>
  );
};
