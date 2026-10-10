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
import { collection, doc, getDocs, getDocsFromServer, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { BADGES, BadgeId } from '../constants/badges';
import { Activity } from '../types';
import { getTopic, getSubjectAvailability } from '../constants/curriculum';
import { makeLocalQuiz, hasLocalQuestionBank } from '../services/questionBank';
import { useTopicApproval } from '../services/liveApproval';
import confetti from 'canvas-confetti';
import { SoundControls } from './SoundControls';
import { getComparisonVisual } from '../services/comparisonVisual';
import { commitStudentLesson } from '../services/progressLedger';
import { playEffect, playPraise, PRAISES, speakExplanation, stopSpokenAudio } from '../services/soundEngine';

interface LearningModuleProps {
  subject: Subject;
  grade: number;
  onClose: () => void;
  mode?: 'practice' | 'quiz';
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  topicId?: string;
}

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
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty || 'medium');
  const [timeLeft, setTimeLeft] = useState(30);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const savingRef = useRef(false);
  const lessonActivityIdRef = useRef<string | null>(null);
  if (!lessonActivityIdRef.current) lessonActivityIdRef.current = doc(collection(db, 'activities')).id;


  const playSound = useCallback((type: 'correct' | 'incorrect' | 'finish') => playEffect(type), []);
  useEffect(() => () => stopSpokenAudio(), []);

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

  const speak = useCallback((text: string) => speakExplanation(text), []);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;
    const currentQuestion = questions[currentIndex];
    setSelectedOption(option);
    const correct = option === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
      const praiseIndex = Math.floor(Math.random() * PRAISES.length);
      setPraise(PRAISES[praiseIndex]);
      if (!playPraise(praiseIndex)) playSound('correct');
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
    }
  };

  const saveProgress = useCallback(async () => {
    if (!profile || savingRef.current || saveStatus === 'saved') return;
    savingRef.current = true;
    setSaveStatus('saving');
    setSaveError('');
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
      // Only one simple userId filter is needed; composite indexes need not
      // have been deployed to read this parent's own history.
      const historySnap = await getDocsFromServer(query(
        collection(db, 'activities'),
        where('userId', '==', profile.uid)
      ));
      const myHistory = historySnap.docs
        .map(item => item.data() as Activity)
        .filter(item => item.profileId === profile.id);
      const alreadyEarned = profile.badges || [];
      const candidates: BadgeId[] = [];
      if (!alreadyEarned.includes('first_lesson')) candidates.push('first_lesson');
      if (score === questions.length && !alreadyEarned.includes('perfect_score')) candidates.push('perfect_score');
      if (myHistory.length + 1 >= 10 && !alreadyEarned.includes('diligent')) candidates.push('diligent');
      const subjectLessons = myHistory.filter(item => item.subject === subject).length + 1;
      const masteryBadge = `${subject}_master` as BadgeId;
      if (subjectLessons >= 5 && masteryBadge in BADGES && !alreadyEarned.includes(masteryBadge)) {
        candidates.push(masteryBadge);
      }

      const xpPerCorrect = mode === 'quiz' ? 20 : 10;
      const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
      const earnedPoints = Math.floor(score * xpPerCorrect * difficultyMultiplier);
      // The activity, total stars, subject stars, level and badges are
      // committed as one transaction. A failed write saves none of them.
      const earnedBadges = await commitStudentLesson(
        activity, lessonActivityIdRef.current!, earnedPoints, candidates
      );
      setNewBadges(earnedBadges as BadgeId[]);
      setSaveStatus('saved');
    } catch (error) {
      console.warn('Could not save lesson on Firebase:', error instanceof Error ? error.message : 'unknown');
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      setSaveError(
        message.includes('permission') || message.includes('quyền')
          ? 'Firebase từ chối lưu bài học. Cần kiểm tra Firestore Rules.'
          : message.includes('network') || message.includes('unavailable') || message.includes('offline')
            ? 'Mất kết nối Firebase. Bé bấm “Thử lưu lại” khi có mạng.'
            : 'Chưa lưu được điểm và lịch sử. Bé hãy bấm “Thử lưu lại”; dữ liệu không bị lưu nửa chừng.'
      );
      setSaveStatus('error');
    } finally {
      savingRef.current = false;
    }
  }, [profile, subject, score, questions, grade, wrongQuestions, mode, difficulty, topicId, contentSource, saveStatus]);

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
      stopSpokenAudio();
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setPraise("");
      setHintUsed(false);
    } else {
      stopSpokenAudio();
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
        {saveStatus === 'saving' && <p role="status" className="mb-3 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">Đang lưu kết quả và sao lên Firebase…</p>}
        {saveStatus === 'saved' && <p role="status" className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Đã lưu điểm, cấp và lịch sử học tập thành công.</p>}
        {saveStatus === 'error' && (
          <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="mb-2 font-semibold">{saveError}</p>
            <button type="button" onClick={() => { void saveProgress(); }}
              className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">Thử lưu lại</button>
          </div>
        )}
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
  const comparisonSides = comparisonMatch
    ? [getComparisonVisual(comparisonMatch[1]), getComparisonVisual(comparisonMatch[2])]
    : null;
  const compactComparison = comparisonSides?.every(Boolean) ?? false;
  const comparisonOptions = compactComparison
    && currentQuestion.options.length === 3
    && currentQuestion.options.every(option => ['<', '>', '='].includes(option.trim()));

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
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

      <div className={`flex flex-wrap justify-between items-center gap-2 ${compactComparison ? 'mb-4' : 'mb-8'}`}>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Câu hỏi {currentIndex + 1} / {questions.length}
          </span>
          <button type="button" onClick={() => setShowAudioSettings(v=>!v)}
             className="rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-black text-blue-600 hover:bg-sky-100"
             aria-expanded={showAudioSettings}>♫ Âm thanh</button>
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

      {showAudioSettings && <div className="mb-5"><SoundControls compact /></div>}
       <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className={`font-bold text-gray-800 leading-relaxed text-center ${compactComparison ? 'text-lg sm:text-xl mb-3' : 'text-2xl mb-6'}`}>
            {compactComparison ? 'Điền dấu thích hợp giữa hai số:' : currentQuestion.text}
          </h2>
          {compactComparison && comparisonSides && (
            <div className="mb-4 grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] sm:gap-3" aria-label="Hai số cần so sánh">
              {comparisonSides.map((visual, side) => visual && (
                <React.Fragment key={side}>
                  {side === 1 && <div className="flex items-center justify-center text-3xl font-black text-indigo-600 sm:text-4xl" aria-hidden="true">?</div>}
                  <div className={`flex min-h-[100px] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 py-3 sm:min-h-[116px] sm:px-3 ${side === 0 ? 'border-blue-100 bg-blue-50' : 'border-amber-100 bg-amber-50'}`}>
                    <span className="max-w-full break-words text-center text-[clamp(1.5rem,4vw,2.5rem)] font-black leading-tight tracking-tight text-slate-800 tabular-nums">{visual.display}</span>
                    {visual.useDots ? (
                      visual.dots === 0
                        ? <span className="text-xs font-semibold text-slate-500">Không có chấm</span>
                        : <div className="flex max-w-[145px] flex-wrap justify-center gap-1.5" aria-label={`${visual.dots} chấm minh họa`}>
                            {Array.from({ length: visual.dots }, (_, dot) => (
                              <span key={dot} className={`h-2.5 w-2.5 rounded-full ${side === 0 ? 'bg-blue-500' : 'bg-amber-500'}`} aria-hidden="true" />
                            ))}
                          </div>
                    ) : (
                      <div className="flex max-w-full flex-col items-center gap-1" aria-label={`Số có ${visual.digitCount} chữ số`}>
                        <div className="flex max-w-full flex-wrap justify-center gap-0.5 sm:gap-1" aria-hidden="true">
                          {visual.digits.map((digit, i) => (
                            <span key={i} className={`flex h-7 w-6 items-center justify-center rounded-md border border-white bg-white/80 text-sm font-extrabold tabular-nums shadow-sm sm:h-8 sm:w-7 sm:text-base ${side === 0 ? 'text-blue-700' : 'text-amber-700'}`}>{digit}</span>
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">{visual.digitCount} chữ số · So từ hàng lớn nhất</span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
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

          <div className={`grid mb-6 ${comparisonOptions ? 'grid-cols-3 gap-2 sm:gap-3' : 'grid-cols-1 gap-4'}`}>
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
                className={`${comparisonOptions ? 'px-2 py-3 text-center justify-center sm:py-4' : 'p-4 text-left justify-between'} rounded-2xl border-2 transition-all flex items-center ${
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
                  <span className={`${comparisonOptions ? 'text-3xl sm:text-4xl' : 'text-xl'} font-bold`}>{option}</span>
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
                    onClick={() => { if (!speak(`Đáp án đúng là ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`)) setShowAudioSettings(true); }}
                    className={`p-3 rounded-2xl transition-all ${isCorrect ? 'bg-green-200 text-green-700 hover:bg-green-300' : 'bg-red-200 text-red-700 hover:bg-red-300'}`}
                    title="Đọc giải thích (cần bật giọng đọc trong Âm thanh)"
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
