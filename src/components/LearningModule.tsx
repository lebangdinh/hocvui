import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  Loader2, 
  Star, 
  Lightbulb,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Mic,
  MicOff
} from 'lucide-react';
import { Subject, Question } from '../types';
import { generateQuestions } from '../services/geminiService';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment, getDocs, query, where, arrayUnion, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { BADGES, BadgeId } from '../constants/badges';
import { Activity } from '../types';
import { getTopic, getSubjectAvailability } from '../constants/curriculum';
import { makeLocalQuiz, hasLocalQuestionBank } from '../services/questionBank';
import { useTopicApproval } from '../services/liveApproval';
import confetti from 'canvas-confetti';

interface LearningModuleProps {
  subject: Subject;
  grade: number;
  onClose: () => void;
  mode?: 'practice' | 'quiz';
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  topicId?: string;
}

const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  finish: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  bg: 'https://assets.mixkit.co/music/preview/mixkit-happy-and-joyful-15.mp3'
};

const PRAISES = [
  "Tuyệt vời quá bé ơi! 🌟",
  "Bé giỏi quá đi mất! 👏",
  "Đúng rồi! Bé thông minh thật đấy! 🧠✨",
  "Xuất sắc luôn! Tiếp tục phát huy nhé! 🚀",
  "Bé làm tốt lắm! Tặng bé một tràng pháo tay! 🎉",
  "Câu trả lời hoàn hảo! Bé thật là siêu! 🏆",
  "Đỉnh của chóp luôn bé ơi! 💎",
  "Bé học nhanh quá, ba mẹ sẽ tự hào lắm đây! ❤️"
];

export const LearningModule: React.FC<LearningModuleProps> = ({ 
  subject, 
  grade, 
  onClose,
  mode = 'practice',
  initialDifficulty,
  topicId
}) => {
  const { profile, addPoints } = useAuth();
  const liveApproved = useTopicApproval(topicId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Activity['wrongQuestions']>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [contentSource, setContentSource] = useState<'reviewed' | 'bank' | 'ai'>('ai');
  const [finished, setFinished] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);
  const [praise, setPraise] = useState<string>("");
  const [hintUsed, setHintUsed] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty || 'medium');
  const [timeLeft, setTimeLeft] = useState(30);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    if (type === 'bg') return null;
    const audio = new Audio(SOUNDS[type]);
    const volumes: Record<string, number> = {
      correct: 0.2,
      incorrect: 0.1,
      finish: 0.2
    };
    audio.volume = volumes[type] || 0.2;
    audio.play().catch(e => console.log('Audio play failed:', e));
    return audio;
  }, []);

  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio(SOUNDS.bg);
      bgMusicRef.current.loop = true;
    }

    if (isMusicPlaying) {
      bgMusicRef.current.play().catch(e => console.log('Audio play failed:', e));
    } else {
      bgMusicRef.current.pause();
    }

    bgMusicRef.current.volume = musicVolume;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isMusicPlaying, musicVolume]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!profile) return;
      setLoading(true);
      setLoadError('');
      if (getSubjectAvailability(grade, subject) === 'unavailable') {
        setLoadError('Môn học này không thuộc khối lớp đang chọn.');
        setLoading(false);
        return;
      }
      if (mode === 'quiz' && (!hasLocalQuestionBank(grade, subject, topicId) || !liveApproved)) {
        setLoadError('Chế độ thử sức chỉ mở sau khi giáo viên duyệt đầy đủ bộ câu hỏi và đối chiếu chương trình. Bé có thể chọn Luyện tập.');
        setLoading(false);
        return;
      }
      if (hasLocalQuestionBank(grade, subject, topicId)) {
        try {
          setQuestions(makeLocalQuiz(grade, subject, initialDifficulty || 'medium', topicId));
          setContentSource(liveApproved ? 'reviewed' : 'bank');
        } catch (error) {
          console.error('Không thể mở ngân hàng bài luyện:', error);
          setLoadError('Ngân hàng bài tập của chủ đề này đang được kiểm tra.');
        } finally {
          setLoading(false);
        }
        return;
      }
      
      // Fetch history for weakness analysis and difficulty adaptation
      let history: Activity[] = [];
      try {
        const q = query(
          collection(db, 'activities'),
          where('userId', '==', profile.uid),
          where('profileId', '==', profile.id),
          where('subject', '==', subject),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        history = querySnapshot.docs.map(doc => doc.data() as Activity);
      } catch (error) {
        console.error("Error fetching history:", error);
      }

      // Update displayed difficulty without re-running the question-loading effect.
      let effectiveDifficulty = initialDifficulty || difficulty;
      if (!initialDifficulty && history.length > 0) {
        const sameGradeHistory = history.filter(h => h.grade === grade && h.totalQuestions > 0);
        if (sameGradeHistory.length > 0) {
          const recentScores = sameGradeHistory.slice(0, 3).map(h => (h.score / h.totalQuestions) * 100);
          const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
          effectiveDifficulty = avgScore >= 80 ? 'hard' : avgScore >= 50 ? 'medium' : 'easy';
          setDifficulty(effectiveDifficulty);
        }
      }

      try {
        const data = await generateQuestions(subject, grade, history, effectiveDifficulty, topicId, profile.id);
        if (!data.length) throw new Error('AI không trả về bộ câu hỏi hợp lệ.');
        setContentSource('ai');
        setQuestions(data);
      } catch (error) {
        console.error('Question generation failed', error);
        setLoadError('Không thể tạo câu hỏi lúc này. Hãy kiểm tra kết nối và cấu hình Gemini rồi thử lại.');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [subject, grade, profile?.id, profile?.uid, initialDifficulty, topicId, mode, liveApproved]);

  const speak = useCallback((text: string) => {
    if (!isSpeechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [isSpeechEnabled]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    const currentQuestion = questions[currentIndex];
    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
      const praiseText = PRAISES[Math.floor(Math.random() * PRAISES.length)];
      setPraise(praiseText);
      playSound('correct');
      speak(`${praiseText}. Đáp án đúng là ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b']
      });
    } else {
      setWrongQuestions(prev => [...(prev || []), {
        text: currentQuestion.text,
        topic: currentQuestion.topic,
        userAnswer: option,
        correctAnswer: currentQuestion.correctAnswer
      }]);
      setPraise("");
      playSound('incorrect');
      speak(`Chưa chính xác rồi. Đáp án đúng là ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`);
    }
  };

  const saveProgress = useCallback(async () => {
    if (!profile) return;
    const activity: Activity = {
      userId: profile.uid,
      profileId: profile.id,
      subject,
      score,
      totalQuestions: questions.length,
      grade,
      timestamp: new Date().toISOString(),
      wrongQuestions,
      topics: Array.from(new Set(questions.map(q => q.topic).filter((t): t is string => !!t))),
      topicId: getTopic(grade, subject, topicId)?.id,
      contentSource
    };
    
    try {
      await addDoc(collection(db, 'activities'), activity);
      
      // Check for badges
      const unlockedBadges: BadgeId[] = [];
      const currentBadges = profile.badges || [];

      // 1. First lesson
      if (!currentBadges.includes('first_lesson')) {
        unlockedBadges.push('first_lesson');
      }

      // 2. Perfect score
      if (score === questions.length && !currentBadges.includes('perfect_score')) {
        unlockedBadges.push('perfect_score');
      }

      // 3. Cumulative badges (need to fetch history for this specific profile)
      const q = query(
        collection(db, 'activities'), 
        where('userId', '==', profile.uid),
        where('profileId', '==', profile.id)
      );
      const historySnap = await getDocs(q);
      const history = historySnap.docs.map(d => d.data());
      
      const totalLessons = history.length;
      const subjectLessons = history.filter(h => h.subject === subject).length;

      if (totalLessons >= 10 && !currentBadges.includes('diligent')) {
        unlockedBadges.push('diligent');
      }

      if (subjectLessons >= 5) {
        const badgeId = `${subject}_master` as BadgeId;
        if (badgeId in BADGES && !currentBadges.includes(badgeId)) {
          unlockedBadges.push(badgeId);
        }
      }

      setNewBadges(unlockedBadges);

      const xpPerCorrect = mode === 'quiz' ? 20 : 10;
      const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
      const totalXP = Math.floor(score * xpPerCorrect * difficultyMultiplier);

      const userRef = doc(db, 'users', profile.uid, 'profiles', profile.id);
      const updates: any = {
        totalPoints: increment(totalXP),
        level: Math.floor((profile.totalPoints + totalXP) / 1000) + 1,
        [`subjectPoints.${subject}`]: increment(totalXP)
      };

      if (unlockedBadges.length > 0) {
        updates.badges = arrayUnion(...unlockedBadges);
      }

      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'activities');
    }
  }, [profile, subject, score, questions.length, grade, wrongQuestions, mode, difficulty, topicId, contentSource]);

  // Timer for Quiz mode
  useEffect(() => {
    if (mode !== 'quiz' || finished || loading || selectedOption) return;
    
    if (timeLeft <= 0) {
      handleOptionSelect(""); // Auto-fail if time runs out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, finished, loading, selectedOption, timeLeft]);

  // Reset timer on next question
  useEffect(() => {
    if (mode === 'quiz') {
      const baseTime = difficulty === 'hard' ? 20 : difficulty === 'medium' ? 30 : 45;
      setTimeLeft(baseTime);
    }
  }, [currentIndex, mode, difficulty]);

  const nextQuestion = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setPraise("");
      setHintUsed(false);
    } else {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setFinished(true);
      playSound('finish');
      await saveProgress();
    }
  }, [currentIndex, questions.length, playSound, saveProgress]);

  // Auto-next after 6 seconds if correct
  useEffect(() => {
    let timer: any;
    if (isCorrect === true) {
      timer = setTimeout(() => {
        nextQuestion();
      }, 6000);
    }
    return () => clearTimeout(timer);
  }, [isCorrect, nextQuestion]);

  const useHint = async () => {
    if (!profile || hintUsed || selectedOption || profile.totalPoints < 5) return;
    
    try {
      await addPoints(-5);
      setHintUsed(true);
      playSound('correct'); // Use a positive sound for hint
    } catch (error) {
      console.error("Failed to use hint:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-lg font-medium text-gray-600">Đang chuẩn bị bài học vui nhộn...</p>
      </div>
    );
  }

  if (loadError || !questions.length) {
    return <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 shadow text-center space-y-4">
      <p className="text-red-600 font-bold">{loadError || 'Không có bài tập phù hợp.'}</p>
      <button onClick={onClose} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold">Chọn chủ đề khác</button>
    </div>;
  }

  if (finished) {
    const xpPerCorrect = mode === 'quiz' ? 20 : 10;
    const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
    const totalXP = Math.floor(score * xpPerCorrect * difficultyMultiplier);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md mx-auto"
      >
        <Trophy className="mx-auto text-yellow-500 mb-4" size={80} />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Tuyệt vời!</h2>
        <p className="text-xl text-gray-600 mb-2">
          Bạn đã hoàn thành bài học với số điểm: <span className="font-bold text-blue-600">{score}/{questions.length}</span>
        </p>
        <div className="flex items-center justify-center gap-2 mb-6 bg-yellow-50 py-2 px-4 rounded-full border border-yellow-100 w-fit mx-auto">
          <Star size={20} className="text-yellow-500 fill-yellow-500" />
          <span className="font-black text-yellow-700 text-lg">+{totalXP} sao</span>
        </div>

        {newBadges.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
            <h3 className="text-yellow-800 font-bold mb-3 flex items-center justify-center gap-2">
              <Star size={20} className="fill-yellow-500" />
              Bạn đã nhận được huy hiệu mới!
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {newBadges.map(id => {
                const badge = BADGES[id];
                const Icon = badge.icon;
                return (
                  <div key={id} className="flex flex-col items-center gap-1">
                    <div className={`${badge.bgColor} p-3 rounded-full`}>
                      <Icon className={badge.color} size={32} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-colors shadow-lg"
        >
          Quay lại trang chủ
        </button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const comparisonMatch = (contentSource === 'reviewed' || contentSource === 'bank') && subject === 'math'
    ? currentQuestion.text.match(/(\d+)\s+\?\s+(\d+)/)
    : null;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
      <div className="text-[11px] text-gray-500 mb-4 pr-24">
        {contentSource === 'bank' ? 'Ngân hàng bài luyện tự biên soạn · chưa đối chiếu từng bài SGK/chưa được giáo viên thẩm định' : contentSource === 'reviewed' ? 'Bài có hồ sơ giáo viên duyệt · cần kiểm tra xác thực trước khi dùng chính thức' : 'Câu hỏi do AI tạo theo chủ đề · phụ huynh nên rà soát đáp án'}
      </div>
      {/* Mode & Difficulty Badges */}
      <div className="absolute top-0 right-0 flex gap-2 p-4">
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          mode === 'quiz' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'bg-blue-100 text-blue-600 border border-blue-200'
        }`}>
          {mode === 'quiz' ? 'Tự thử sức' : 'Luyện tập'}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          difficulty === 'hard' ? 'bg-red-100 text-red-600 border border-red-200' :
          difficulty === 'medium' ? 'bg-blue-100 text-blue-600 border border-blue-200' :
          'bg-green-100 text-green-600 border border-green-200'
        }`}>
          {difficulty === 'hard' ? 'Siêu nhân' : difficulty === 'medium' ? 'Thông thái' : 'Dễ thương'}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Câu hỏi {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <button
              onClick={() => setIsMusicPlaying(!isMusicPlaying)}
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              {isMusicPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex items-center gap-2 group relative">
              <button 
                onClick={() => setMusicVolume(musicVolume === 0 ? 0.2 : 0)}
                className="text-gray-500 hover:text-blue-500 transition-colors"
              >
                {musicVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <button
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={`p-1.5 rounded-lg transition-colors ${isSpeechEnabled ? 'text-blue-500 bg-blue-50' : 'text-gray-400 bg-gray-50'}`}
              title={isSpeechEnabled ? "Tắt đọc đáp án" : "Bật đọc đáp án"}
            >
              {isSpeechEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
          </div>
          {!selectedOption && !hintUsed && (
            <button
              onClick={useHint}
              disabled={profile?.totalPoints! < 5}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                profile?.totalPoints! >= 5 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
              title="Dùng 5 sao để xem gợi ý"
            >
              <Lightbulb size={14} />
              Gợi ý (5 ⭐)
            </button>
          )}
          {hintUsed && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-white border border-yellow-600 animate-pulse">
              <Lightbulb size={14} />
              Đã dùng gợi ý!
            </div>
          )}
        </div>
        <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {mode === 'quiz' && !selectedOption && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-2xl border border-red-100 mb-6">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
            {timeLeft}
          </div>
          <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${(timeLeft / (difficulty === 'hard' ? 20 : difficulty === 'medium' ? 30 : 45)) * 100}%` }}
              className={`h-full ${timeLeft < 5 ? 'bg-red-600' : 'bg-red-400'}`}
            />
          </div>
          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Thời gian</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed text-center">
            {comparisonMatch ? 'Điền dấu thích hợp giữa hai số:' : currentQuestion.text}
          </h2>
          {comparisonMatch && (
            <div className="grid grid-cols-[1fr_65px_1fr] gap-2 sm:gap-4 items-stretch mb-7">
              {[comparisonMatch[1], '?', comparisonMatch[2]].map((number, side) => side === 1 ? (
                <div key="question-mark" className="flex items-center justify-center text-5xl font-black text-indigo-500">?</div>
              ) : (
                <div key={side} className={`min-h-44 rounded-3xl p-3 border-2 ${side === 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'} flex flex-col items-center justify-center gap-3`}>
                  <span className="text-5xl font-black text-gray-800">{number}</span>
                  <div className="max-w-36 flex flex-wrap justify-center gap-1.5" aria-hidden="true">
                    {Array.from({ length: Number(number) }, (_, dot) => (
                      <span key={dot} className={`w-2.5 h-2.5 rounded-full ${side === 0 ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {hintUsed && currentQuestion.hint && !selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-3"
              >
                <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600 shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-800 mb-1">Gợi ý cho bé:</p>
                  <p className="text-sm text-yellow-700 leading-relaxed">{currentQuestion.hint}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={!selectedOption ? { scale: 1.02, x: 5 } : {}}
                whileTap={!selectedOption ? { scale: 0.98 } : {}}
                animate={
                  selectedOption === option 
                    ? isCorrect 
                      ? { 
                          scale: [1, 1.1, 1], 
                          y: [0, -15, 0],
                          transition: { duration: 0.5, times: [0, 0.5, 1] } 
                        } 
                      : { 
                          x: [-8, 8, -8, 8, 0], 
                          transition: { duration: 0.4 } 
                        }
                    : {}
                }
                onClick={() => handleOptionSelect(option)}
                disabled={!!selectedOption}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                  selectedOption === option
                    ? isCorrect 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                    : selectedOption && option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : hintUsed && option === currentQuestion.correctAnswer
                        ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{option}</span>
                  {hintUsed && option === currentQuestion.correctAnswer && !selectedOption && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-yellow-600"
                    >
                      <Lightbulb size={18} />
                    </motion.div>
                  )}
                </div>
                <AnimatePresence>
                  {selectedOption === option && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ 
                        scale: [0, 1.2, 1], 
                        rotate: 0,
                        transition: { duration: 0.3 }
                      }}
                      className="flex items-center"
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="text-green-500" size={28} />
                      ) : (
                        <XCircle className="text-red-500" size={28} />
                      )}
                    </motion.div>
                  )}
                  {selectedOption && !isCorrect && option === currentQuestion.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 text-green-600 font-bold"
                    >
                      <CheckCircle2 size={20} />
                      <span>Đáp án đúng</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl mb-8 ${isCorrect ? 'bg-green-50 border-2 border-green-100' : 'bg-red-50 border-2 border-red-100'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {isCorrect ? <Trophy size={24} /> : <Lightbulb size={24} />}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? praise : 'Bé đừng buồn nhé!'}
                      </h4>
                      <p className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        Đáp án đúng là: <span className="text-xl underline">{currentQuestion.correctAnswer}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => speak(`Đáp án đúng là ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`)}
                    className={`p-3 rounded-2xl transition-all ${isCorrect ? 'bg-green-200 text-green-700 hover:bg-green-300' : 'bg-red-200 text-red-700 hover:bg-red-300'}`}
                    title="Nghe lại đáp án"
                  >
                    <Volume2 size={24} />
                  </button>
                </div>
                <p className={`text-lg leading-relaxed ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {currentQuestion.explanation}
                </p>
                
                <button
                  onClick={nextQuestion}
                  className={`mt-6 w-full py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isCorrect 
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-200' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200'
                  }`}
                >
                  {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài học'}
                  <ArrowRight size={24} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
