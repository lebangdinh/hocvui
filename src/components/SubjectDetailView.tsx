import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Play, 
  Trophy, 
  Star, 
  Target,
  Gamepad2,
  BookOpen,
  TrendingUp,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { Subject } from '../types';
import { SUBJECT_CONFIG } from '../constants/subjects';
import { useAuth } from '../AuthContext';
import { BADGES } from '../constants/badges';
import { getTopics, getSubjectAvailability } from '../constants/curriculum';
import { hasLocalQuestionBank, getLocalQuestionCount } from '../services/questionBank';
import { useTopicApproval } from '../services/liveApproval';
import { getTopicReview } from '../services/contentReview';

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
  const [selectedTopicId, setSelectedTopicId] = React.useState(topics[0]?.id || '');
  React.useEffect(() => { setSelectedTopicId(topics[0]?.id || ''); }, [profile?.grade, subject]);
  const review = getTopicReview(profile?.grade || 2, subject, selectedTopicId);
  const liveApproved = useTopicApproval(selectedTopicId);
  const canQuiz = hasLocalQuestionBank(profile?.grade || 2, subject, selectedTopicId) && liveApproved;
  
  const subjectPoints = profile?.subjectPoints?.[subject] || 0;
  const level = Math.floor(subjectPoints / 100) + 1;
  const progress = (subjectPoints % 100);

  // Filter badges for this subject
  const subjectBadges = (profile?.badges || []).filter(id => id.startsWith(subject));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${config.color} text-white shadow-lg`}>
            <Icon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{config.title}</h1>
            <p className="text-gray-500 font-medium">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-3xl bg-white border border-orange-100 shadow-sm p-5 sm:p-6">
        <h2 className="font-black text-gray-800 mb-2">Chọn chủ đề · Lớp {profile?.grade || 2}</h2>
        <p className="text-xs text-gray-500 mb-3">Các chủ đề định hướng theo CTGDPT 2018. Bài AI cần được phụ huynh/giáo viên kiểm tra nếu dùng để đánh giá chính thức.</p>
        {getSubjectAvailability(profile?.grade || 2, subject) === 'optional' &&
          <p className="text-sm text-amber-700 mb-3">Tiếng Anh lớp 1–2 hiện được xếp vào nội dung tự chọn theo chương trình áp dụng.</p>}
        <select aria-label="Chủ đề bài học" value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)}
          className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-3 font-bold text-gray-800">
          {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
        </select>
        <p className="mt-2 text-xs text-gray-500">{topics.find(t => t.id === selectedTopicId)?.scope || ''}</p>
        <div className={`mt-3 text-xs font-bold px-3 py-2 rounded-xl ${hasLocalQuestionBank(profile?.grade || 2, subject, selectedTopicId) ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
          {hasLocalQuestionBank(profile?.grade || 2, subject, selectedTopicId)
            ? `📚 Có bài soạn sẵn (${getLocalQuestionCount(profile?.grade || 2, subject, selectedTopicId)} câu/lượt) · ${liveApproved ? 'đã có hồ sơ duyệt Firebase hợp lệ' : 'chưa thẩm định bởi giáo viên'}`
            : '✨ Chủ đề đang sử dụng AI để tạo bài · cần kiểm tra đáp án'}
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1">
          <p className="font-bold">📋 {liveApproved ? 'Đã có hồ sơ duyệt Firebase theo phiên bản hiện hành' : review.label}</p>
          {review.bookLesson ? <p><b>Mục lục SGK tham chiếu:</b> {review.bookLesson}</p> : <p>Chưa đối chiếu được đầu mục sách giáo khoa cho chủ đề này.</p>}
          {review.tocUrl && <a className="text-blue-600 underline" href={review.tocUrl} target="_blank" rel="noopener noreferrer">Tra cứu mục lục (nguồn tham khảo thứ cấp)</a>}
          {review.outcomeDraft && <p><b>Yêu cầu cần đạt (tóm lược tham chiếu):</b> {review.outcomeDraft}</p>}
          {review.outcomeSource && <a className="text-blue-600 underline block" href={review.outcomeSource} target="_blank" rel="noopener noreferrer">Xem chương trình môn học của Bộ GD&ĐT (bản tài liệu tham chiếu)</a>}
          {review.outcomeVerification === 'official_math_subject_checked_partial' && <p className="text-amber-800">Đã đối chiếu sơ bộ với văn bản chương trình môn Toán, chưa đối chiếu từng câu và chưa có giáo viên ký duyệt.</p>}
          {review.note && <p>{review.note}</p>}
          {!liveApproved && <p>Yêu cầu cần đạt và từng câu hỏi chưa được coi là đạt chuẩn cho đến khi có hồ sơ giáo viên duyệt.</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Progress & Stats */}
        <div className="md:col-span-1 space-y-6">
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

          {/* Difficulty Quick Selection */}
          <div className="bg-white p-6 rounded-[32px] shadow-xl border-2 border-gray-50">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-red-500" />
              Chọn thử thách
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'easy', name: 'Dễ thương', color: 'bg-green-500', desc: 'Làm quen kiến thức' },
                { id: 'medium', name: 'Thông thái', color: 'bg-blue-500', desc: 'Kiến thức trọng tâm' },
                { id: 'hard', name: 'Siêu nhân', color: 'bg-red-500', desc: 'Nâng cao thử thách' }
              ].map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStartLearning('practice', d.id as any, selectedTopicId)}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-50 hover:border-gray-200 transition-all text-left"
                >
                  <div className={`w-10 h-10 ${d.color} rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}>
                    <Star size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800">{d.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">{d.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Learning Modules & Games */}
        <div className="md:col-span-2 space-y-6">
          {/* Learning Modules */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <GraduationCap size={24} className="text-blue-500" />
                Mô-đun học tập
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Practice */}
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onStartLearning('practice', undefined, selectedTopicId)}
                className="bg-white p-6 rounded-[32px] shadow-xl border-2 border-blue-50 flex flex-col gap-4 text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 relative z-10">
                  <BookOpen size={28} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black text-gray-800">Luyện tập</h4>
                  <p className="text-xs text-gray-500 font-medium mb-4">Học kiến thức mới với độ khó tự động điều chỉnh.</p>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <span>Bắt đầu ngay</span>
                    <Play size={12} fill="currentColor" />
                  </div>
                </div>
              </motion.button>

              {/* Quiz */}
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => canQuiz && onStartLearning('quiz', undefined, selectedTopicId)}
                disabled={!canQuiz}
                title={!canQuiz ? 'Chỉ mở thử sức khi bài đã được giáo viên duyệt' : undefined}
                className={`bg-white p-6 rounded-[32px] shadow-xl border-2 border-purple-50 flex flex-col gap-4 text-left group relative overflow-hidden ${!canQuiz ? 'opacity-55 cursor-not-allowed' : ''}`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 relative z-10">
                  <Trophy size={28} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black text-gray-800">Tự thử sức</h4>
                  <p className="text-xs text-gray-500 font-medium mb-4">{canQuiz ? 'Thử sức có tính giờ từ bộ bài được duyệt (không phải kiểm tra ở trường).' : 'Chờ giáo viên duyệt nội dung. Vẫn có thể chọn Luyện tập.'}</p>
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
                      {gameType === 'puzzle' ? 'Xếp hình' : 
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
