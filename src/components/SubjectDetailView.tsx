import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Play, 
  Trophy, 
  Star, 
  Target,
  Gamepad2,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import { Subject } from '../types';
import { SUBJECT_CONFIG } from '../constants/subjects';
import { useAuth } from '../AuthContext';
import { BADGES } from '../constants/badges';
import { getTopics, getSubjectAvailability } from '../constants/curriculum';
import { hasLocalQuestionBank, getLocalQuestionCount, getPracticeDifficulties, resolvePracticeDifficulty, getUnseenQuestionCount, MIXED_TOPIC_ID } from '../services/questionBank';
import { useTopicApproval } from '../services/liveApproval';
import { isRotationHistoryPersistent } from '../services/questionRotation';
import bankAudit from '../../content/v10-quality-audit.json';
import { getTopicReview } from '../services/contentReview';
import { getAiScreening, isEligibleForAiPractice } from '../services/aiScreening';

interface SubjectDetailViewProps {
  subject: Subject;
  onBack: () => void;
  onStartLearning: (mode: 'practice' | 'quiz', difficulty?: 'easy' | 'medium' | 'hard', topicId?: string) => void;
  onPlayGame: (gameType: string) => void;
}

const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({ 
  subject, 
  onBack, 
  onStartLearning,
  onPlayGame
}) => {
  const { profile } = useAuth();
  const config = SUBJECT_CONFIG[subject];
  const Icon = config.icon;
  const topics = getTopics(profile?.grade || 2, subject);
  const [difficulty, setDifficulty] = React.useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTopicId, setSelectedTopicId] = React.useState(MIXED_TOPIC_ID);
  React.useEffect(() => { setSelectedTopicId(MIXED_TOPIC_ID); }, [profile?.grade, subject]);
  const isMixed = selectedTopicId === MIXED_TOPIC_ID;
  const review = getTopicReview(profile?.grade || 2, subject, isMixed ? undefined : selectedTopicId);
  const liveApproved = useTopicApproval(isMixed ? undefined : selectedTopicId);
  const aiScreen = getAiScreening(selectedTopicId);
  const levels = getPracticeDifficulties(profile?.grade || 2, subject, selectedTopicId);
  const effectiveDifficulty = resolvePracticeDifficulty(profile?.grade || 2, subject, difficulty, selectedTopicId);
  const newQuestions = getUnseenQuestionCount(profile?.grade || 2,subject,selectedTopicId,profile?.id,effectiveDifficulty);
  const canQuiz = (newQuestions === null || newQuestions > 0) && hasLocalQuestionBank(profile?.grade || 2, subject, selectedTopicId) && (isMixed || liveApproved || isEligibleForAiPractice(subject, selectedTopicId));
  
  const historyPersistent = isRotationHistoryPersistent();
  const subjectPoints = profile?.subjectPoints?.[subject] || 0;
  const level = Math.floor(subjectPoints / 100) + 1;
  const progress = (subjectPoints % 100);

  // Filter badges for this subject
  const subjectBadges = (profile?.badges || []).filter(id => id.startsWith(subject));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          aria-label="Quay lại danh sách môn học"
          className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${config.color} text-white shadow-lg`}>
            <Icon size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{config.title}</h1>
            <p className="text-gray-500 font-medium">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-3xl bg-white border border-orange-100 shadow-sm p-5 sm:p-6">
        <h2 className="font-black text-gray-800 mb-2">Chọn kiểu luyện tập · Lớp {profile?.grade || 2} <span className="text-xs rounded bg-blue-100 text-blue-700 px-2 py-1">Học Vui V11</span></h2>

        {getSubjectAvailability(profile?.grade || 2, subject) === 'optional' &&
          <p className="text-sm text-amber-700 mb-3">Tiếng Anh lớp 1–2 hiện được xếp vào nội dung tự chọn theo chương trình áp dụng.</p>}
        <select aria-label="Chủ đề bài học" value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)}
          className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-3 font-bold text-gray-800">
          <option value={MIXED_TOPIC_ID}>🔀 Luyện tập chung – trộn câu từ tất cả chủ đề</option>
          {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
        </select>
        <p className="mt-2 text-xs text-gray-500">{isMixed ? 'Mỗi lượt tối đa 8 câu từ nhiều chủ đề, ưu tiên kiến thức chưa gặp. Không đảo lời văn để tính thành câu mới.' : topics.find(t => t.id === selectedTopicId)?.scope || ''}</p>
        <div className={`mt-3 text-xs font-bold px-3 py-2 rounded-xl ${hasLocalQuestionBank(profile?.grade || 2, subject, selectedTopicId) ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
          {hasLocalQuestionBank(profile?.grade || 2, subject, selectedTopicId)
            ? `📚 ${isMixed ? 'Luyện tập tổng hợp' : 'Có bài soạn sẵn'} (tối đa ${getLocalQuestionCount(profile?.grade || 2, subject, selectedTopicId)} câu/lượt) · ${isMixed ? 'xoay vòng câu chưa gặp trong môn' : ''} ${liveApproved ? 'có hồ sơ giáo viên duyệt' : subject === 'math' ? 'bài sinh bằng thuật toán, kiểm tra tự động' : `AI sơ tuyển ${aiScreen.screened} câu · chưa thẩm định bởi giáo viên`}`
            : '✨ Chủ đề đang sử dụng AI để tạo bài · cần kiểm tra đáp án'}
        </div>
        {!historyPersistent && <p role="alert" className="mt-2 text-xs text-red-700">⚠ Trình duyệt đang chặn lưu lịch sử. Để chống lặp sau khi đóng trang, hãy bật lưu dữ liệu trang web và không dùng cửa sổ ẩn danh.</p>}
        {newQuestions !== null && <p className={`mt-2 text-sm font-semibold ${newQuestions===0?'text-amber-700':'text-emerald-700'}`} role="status">{newQuestions===0 ? 'Đã hết câu mới trong lựa chọn này. Hãy chọn môn hoặc chủ đề khác; ứng dụng không tự lặp câu cũ.' : `Còn ${newQuestions} nhóm câu mới chưa luyện trên trình duyệt này.`}</p>}
        {levels.length > 1 ? <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-bold text-gray-800">Chọn mức luyện tập</legend>
          <div className={`grid ${levels.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
            {([
              ['easy', 'Dễ thương'], ['medium', 'Thông thái'], ['hard', 'Siêu nhân']
            ] as const).filter(([id]) => levels.includes(id)).map(([id, label]) => (
              <label key={id} className={`cursor-pointer rounded-xl border-2 px-2 py-3 text-center text-xs sm:text-sm font-bold ${effectiveDifficulty === id ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'}`}>
                <input type="radio" name="difficulty" value={id} checked={effectiveDifficulty === id}
                  onChange={() => setDifficulty(id)} className="mr-1 accent-blue-600" />
                {label}
              </label>
            ))}
          </div>
        </fieldset> : <p className="mt-4 text-sm text-slate-600"><b>{isMixed ? 'Luyện tập chung từ nhiều chủ đề' : 'Bài luyện theo chủ đề'}</b> · Bộ câu hỏi này chưa chia độ khó.</p>}
        <button type="button" disabled={newQuestions===0} onClick={() => onStartLearning('practice', effectiveDifficulty, selectedTopicId)}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-lg font-black text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          <Play size={20} fill="currentColor" /> Bắt đầu luyện tập
        </button>
        <details className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
          <summary className="cursor-pointer py-1 font-bold">Thông tin học liệu dành cho phụ huynh</summary>
          <div className="mt-3 space-y-2">
          <p>Các chủ đề định hướng theo CTGDPT 2018. Phụ huynh/giáo viên cần kiểm tra nội dung trước khi dùng để đánh giá chính thức.</p>
          <p className="font-bold">📋 {isMixed ? 'Tổng hợp các câu qua sàng lọc AI của các chủ đề trong môn; chưa phải giáo viên duyệt' : liveApproved ? 'Đã được giáo viên duyệt theo phiên bản hiện hành' : review.label}</p>
          {review.bookLesson ? <p><b>Mục lục SGK tham chiếu:</b> {review.bookLesson}</p> : <p>Chưa đối chiếu được đầu mục sách giáo khoa cho chủ đề này.</p>}
          {!isMixed && review.tocUrl && <a className="text-blue-600 underline" href={review.tocUrl} target="_blank" rel="noopener noreferrer">Tra cứu mục lục (nguồn tham khảo thứ cấp)</a>}
          {!isMixed && review.outcomeDraft && <p><b>Yêu cầu cần đạt (tóm lược tham chiếu):</b> {review.outcomeDraft}</p>}
          {!isMixed && review.outcomeSource && <a className="text-blue-600 underline block" href={review.outcomeSource} target="_blank" rel="noopener noreferrer">Xem chương trình môn học của Bộ GD&ĐT (bản tài liệu tham chiếu)</a>}
          {review.outcomeVerification === 'official_math_subject_checked_partial' && <p className="text-amber-800">Đã đối chiếu sơ bộ với văn bản chương trình môn Toán, chưa đối chiếu từng câu và chưa có giáo viên ký duyệt.</p>}
          {!isMixed && review.note && <p>{review.note}</p>}
          {!isMixed && !liveApproved && <p>{subject === 'math' ? 'Bài toán kiểm tra bằng quy tắc tự động.' : `Chỉ ${aiScreen.screened} câu qua AI sàng lọc được đưa vào luyện tập; ${aiScreen.held} câu bị tạm giữ.`} Không coi đây là thẩm định giáo viên hay xác nhận khớp từng bài SGK.</p>}
          </div>
        </details>
        <details className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm">
          <summary className="cursor-pointer font-bold text-indigo-800">📊 Kiểm kê ngân hàng câu hỏi và nội dung còn thiếu</summary>
          <p className="mt-2 text-xs text-indigo-900">Chỉ đếm câu qua sàng lọc AI (Toán: bộ sinh theo tham số ổn định). Nhóm câu còn mới tính trên hồ sơ đang chọn trong trình duyệt; không đồng bộ qua thiết bị.</p>
          <div className="mt-2 max-h-64 overflow-auto space-y-2">
            {topics.map(topic => {
              const screened = getAiScreening(topic.id);
              const left = getUnseenQuestionCount(profile?.grade || 2,subject,topic.id,profile?.id,effectiveDifficulty);
              const similar = bankAudit.topics.find(t=>t.topicId===topic.id)?.nearDuplicatePairs || 0;
              return <div key={topic.id} className="rounded-lg bg-white border border-indigo-100 p-2 flex flex-wrap justify-between gap-2">
                <span className="font-semibold text-slate-800">{topic.name}</span>
                <span className="text-xs text-slate-700">{subject === 'math' ? 'Toán sinh theo tham số' : `${screened.screened} câu qua lọc / ${screened.held} tạm giữ`} · <b>{left ?? '—'} nhóm câu chưa luyện</b>{similar > 0 ? ` · ${similar} cặp câu tương tự cần rà soát` : ''}</span>
              </div>;
            })}
          </div>
        </details>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Progress & Stats */}
        <div className="md:col-span-1 space-y-6 order-2 md:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[32px] shadow-xl border-2 border-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-500" />
                Tiến trình
              </h3>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                Cấp độ {level}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-500">Kinh nghiệm</span>
                  <span className="text-blue-600">{subjectPoints} XP</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  Cần thêm {100 - progress} XP để lên cấp tiếp theo
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 p-3 rounded-2xl text-center">
                  <Trophy size={20} className="text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-black text-orange-600">
                    {subjectBadges.length}
                  </div>
                  <div className="text-[10px] font-bold text-orange-400 uppercase">Huy hiệu</div>
                </div>
                <div className="bg-green-50 p-3 rounded-2xl text-center">
                  <Star size={20} className="text-green-500 mx-auto mb-1" />
                  <div className="text-lg font-black text-green-600">
                    {Math.floor(subjectPoints / 10)}
                  </div>
                  <div className="text-[10px] font-bold text-green-400 uppercase">Sao</div>
                </div>
              </div>
            </div>
          </motion.div>


        </div>

        {/* Right Column: Learning Modules & Games */}
        <div className="md:col-span-2 space-y-6 order-1 md:order-2">
          {/* Learning Modules */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <GraduationCap size={24} className="text-blue-500" />
                Mô-đun học tập
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {/* Quiz */}
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => canQuiz && onStartLearning('quiz', effectiveDifficulty, selectedTopicId)}
                disabled={!canQuiz}
                title={!canQuiz ? 'Đã hết câu mới hoặc chưa có câu đã sàng lọc' : undefined}
                className={`bg-white p-6 rounded-[32px] shadow-xl border-2 border-purple-50 flex flex-col gap-4 text-left group relative overflow-hidden ${!canQuiz ? 'opacity-55 cursor-not-allowed' : ''}`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 relative z-10">
                  <Trophy size={28} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black text-gray-800">Tự thử sức</h4>
                  <p className="text-xs text-gray-500 font-medium mb-4">{canQuiz ? 'Có tính giờ · dùng các câu đã qua sàng lọc AI · không tính là bài kiểm tra ở trường.' : 'Hết câu mới hoặc chưa đủ câu qua sàng lọc. Hãy đổi chủ đề.'}</p>
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                    <span>{canQuiz ? 'Thử thách ngay' : 'Chưa mở'}</span>
                    <Trophy size={12} fill="currentColor" />
                  </div>
                </div>
              </motion.button>
            </div>
          </section>
          {/* Related Games */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <Gamepad2 size={24} className="text-purple-500" />
                Trò chơi liên quan
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.relatedGames.map((gameType) => (
                <motion.button
                  key={gameType}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onPlayGame(gameType)}
                  className="bg-white p-5 rounded-[28px] shadow-lg border-2 border-gray-50 flex items-center gap-4 text-left group"
                >
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <Target size={28} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 capitalize">
                      {gameType === 'puzzle' ? 'Bắt sao vui nhộn' :
                       gameType === 'memory' ? 'Trí nhớ' : 
                       gameType === 'chicken' ? 'Bắn gà' : 
                       gameType === 'airplane' ? 'Phi đội' : 
                       gameType === 'tank' ? 'Xe tăng' : 
                       gameType === 'racing' ? 'Đua xe' : gameType}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium">Chơi để nhận thêm XP</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Achievements */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <Trophy size={24} className="text-yellow-500" />
                Thành tích môn học
              </h3>
            </div>
            <div className="bg-white p-6 rounded-[32px] shadow-xl border-2 border-gray-50">
              {subjectBadges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {subjectBadges.map(id => {
                    const badge = BADGES[id];
                    if (!badge) return null;
                    const BadgeIcon = badge.icon;
                    return (
                      <motion.div
                        key={id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center text-center gap-2"
                      >
                        <div className={`w-16 h-16 rounded-full ${badge.bgColor} flex items-center justify-center shadow-inner`}>
                          <BadgeIcon className={badge.color} size={32} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-800">{badge.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium leading-tight">{badge.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <Trophy size={32} />
                  </div>
                  <p className="text-gray-400 font-medium">Bé chưa có huy hiệu nào cho môn này.<br/>Hãy cố gắng học tập nhé!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailView;
