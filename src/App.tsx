import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { signInWithGoogle, logout } from './firebase';
import { SubjectCard } from './components/SubjectCard';
import { LearningModule } from './components/LearningModule';
import { ReportModule } from './components/ReportModule';
import { Subject } from './types';
import { 
  LogOut, 
  User as UserIcon, 
  Trophy, 
  Star, 
  LayoutDashboard, 
  BarChart3, 
  Settings,
  GraduationCap,
  Plus,
  Trash2,
  ChevronRight,
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { BADGES, BadgeId } from './constants/badges';
import { GameModule } from './components/GameModule';
import { AIChatbot } from './components/AIChatbot';
import { BackgroundMusic } from './components/BackgroundMusic';
import { EditorialAdmin } from './components/EditorialAdmin';
import SubjectDetailView from './components/SubjectDetailView';
import { getGradeSubjects, CURRICULUM_META } from './constants/curriculum';
import { describeProfileDeletionError } from './services/profileDeletion';
import { ProfileTrashPanel } from './components/ProfileTrashPanel';

const ProfileSelector = () => {
  const { profiles, profilesError, addProfile, selectProfile, deleteProfile, logout, role } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState(2);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const name = newName.trim();
    if (!name || name.length > 100) {
      setSaveError('Tên học sinh phải có từ 1 đến 100 ký tự.');
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      await addProfile(name, newGrade);
      setNewName('');
      setIsAdding(false);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
      setSaveError(
        message.includes('permission-denied') || message.includes('insufficient permissions')
          ? 'Firebase đang từ chối lưu. Quản trị viên cần xuất bản Firestore Rules của Học Vui V5.'
          : message.includes('unavailable') || message.includes('network')
            ? 'Không kết nối được Firebase. Hãy kiểm tra mạng rồi thử lại.'
            : 'Chưa lưu được hồ sơ. Vui lòng thử lại hoặc báo người quản trị.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (studentId: string, displayName: string) => {
    if (deletingProfileId) return;
    if (!window.confirm(`Chuyển hồ sơ bé ${displayName} vào Thùng rác trong 30 ngày? Điểm và lịch sử được giữ nguyên để khôi phục khi cần.`)) return;
    setDeletingProfileId(studentId);
    setDeleteError(null);
    setDeleteSuccess(null);
    try {
      await deleteProfile(studentId);
      setDeleteSuccess(`Đã chuyển hồ sơ ${displayName} vào Thùng rác. Có thể khôi phục trong 30 ngày.`);
    } catch (error) {
      console.warn('Student profile deletion failed:', error instanceof Error ? error.message : 'unknown');
      setDeleteError(describeProfileDeletionError(error));
    } finally {
      setDeletingProfileId(null);
    }
  };

  if (isManaging && (role === 'admin' || role === 'reviewer')) {
    return <div className="min-h-screen bg-indigo-50 p-6"><button onClick={() => setIsManaging(false)} className="mb-5 rounded-xl bg-white px-5 py-3 font-bold">← Về chọn học sinh</button><EditorialAdmin /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-2xl border-4 border-orange-200"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-orange-600">Ai đang học thế?</h2>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-bold bg-gray-100 px-4 py-2 rounded-xl"
          >
            <LogOut size={20} />
            <span>Thoát</span>
          </button>
        </div>

        {(role === 'admin' || role === 'reviewer') && <button onClick={() => setIsManaging(true)} className="mb-5 w-full rounded-xl bg-indigo-700 p-3 font-bold text-white">Mở cổng duyệt bài (không cần hồ sơ học sinh)</button>}
        {profilesError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{profilesError}</div>}
        {deleteError && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{deleteError}</div>}
        {deleteSuccess && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{deleteSuccess}</div>}
        <ProfileTrashPanel />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {profiles.map(p => (
            <div key={p.id} className="group relative">
              <button
                onClick={() => selectProfile(p)}
                disabled={deletingProfileId !== null}
                className="w-full flex items-center gap-4 p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl border-2 border-transparent hover:border-orange-300 transition-all text-left disabled:opacity-60"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                  <UserIcon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">{p.displayName}</p>
                    {p.favoriteBadge && (
                      <div className={`${BADGES[p.favoriteBadge as BadgeId]?.bgColor} p-1 rounded-md border border-white shadow-sm`}>
                        {React.createElement(BADGES[p.favoriteBadge as BadgeId].icon, { 
                          className: BADGES[p.favoriteBadge as BadgeId].color, 
                          size: 12 
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Lớp {p.grade} • Cấp {p.level}</p>
                </div>
                <ChevronRight className="text-orange-300" />
              </button>
              <button
                type="button"
                aria-label={`Xóa hồ sơ ${p.displayName}`}
                title={`Chuyển bé ${p.displayName} vào Thùng rác 30 ngày`}
                onClick={() => { void handleDeleteProfile(p.id, p.displayName); }}
                disabled={deletingProfileId !== null}
                className="absolute -top-2 -right-2 rounded-full border border-red-100 bg-white p-2 text-red-500 shadow-sm transition-opacity hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-wait disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                {deletingProfileId === p.id ? <span className="text-xs font-bold">...</span> : <Trash2 size={16} />}
              </button>
            </div>
          ))}

          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-4 p-4 bg-white border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-2xl text-orange-400 hover:text-orange-600 transition-all"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Plus size={24} />
              </div>
              <span className="font-bold">Thêm bé mới</span>
            </button>
          ) : (
            <form onSubmit={handleAdd} className="p-4 bg-white border-2 border-orange-200 rounded-2xl space-y-3">
              <input
                autoFocus
                type="text"
                placeholder="Tên của bé..."
                value={newName}
                maxLength={100}
                disabled={saving}
                onChange={e => { setNewName(e.target.value); setSaveError(null); }}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
              {saveError && <p role="alert" className="text-sm font-semibold text-red-600">{saveError}</p>}
              <div className="flex gap-2">
                <select
                  value={newGrade}
                  onChange={e => setNewGrade(Number(e.target.value))}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                >
                  {[1,2,3,4,5].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                </select>
                <button type="submit" disabled={saving} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors">{saving ? 'Đang lưu...' : 'Lưu'}</button>
                <button 
                  type="button" 
                  disabled={saving}
                  onClick={() => { if (!saving) { setIsAdding(false); setSaveError(null); } }} 
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ProgressWidget = ({ profile }: { profile: any }) => {
  const { setFavoriteBadge } = useAuth();
  const currentLevelPoints = profile.totalPoints % 1000;
  const progress = (currentLevelPoints / 1000) * 100;

  const favoriteBadge = profile.favoriteBadge ? BADGES[profile.favoriteBadge as BadgeId] : null;
  const FavoriteIcon = favoriteBadge?.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[32px] shadow-sm border border-orange-100 mb-8"
    >
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Level Progress */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Tiến độ học tập</p>
              <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                Cấp {profile.level || 1}
                <span className="text-sm font-bold text-gray-400">({profile.totalPoints} sao)</span>
              </h3>
            </div>
            <p className="text-xs font-bold text-gray-400">{currentLevelPoints} / 1000</p>
          </div>
          <div className="h-3 bg-orange-50 rounded-full overflow-hidden border border-orange-100/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
            />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-12 bg-orange-100/50" />

        {/* Favorite Badge */}
        <div className="flex flex-col items-center justify-center px-4">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Huy hiệu yêu thích</p>
          {favoriteBadge ? (
            <motion.div 
              layoutId="favorite-badge"
              className={`${favoriteBadge.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center shadow-md border-2 border-white relative group cursor-pointer`}
              onClick={() => setFavoriteBadge(null)}
              title="Nhấn để bỏ chọn"
            >
              <FavoriteIcon className={favoriteBadge.color} size={32} />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 border border-white">
                <Star size={10} className="text-white fill-white" />
              </div>
            </motion.div>
          ) : (
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
              <Trophy size={24} />
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="hidden md:block w-px h-12 bg-orange-100/50" />

        {/* Achievements Preview */}
        <div className="flex-1 w-full">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Huy hiệu của bé (Nhấn để chọn yêu thích)</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {profile.badges && profile.badges.length > 0 ? (
              profile.badges.map((badgeId: BadgeId) => {
                const badge = BADGES[badgeId];
                if (!badge) return null;
                const Icon = badge.icon;
                const isFavorite = profile.favoriteBadge === badgeId;
                return (
                  <motion.button 
                    key={badgeId}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFavoriteBadge(badgeId)}
                    className={`${badge.bgColor} w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${isFavorite ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-white'} shrink-0`}
                    title={badge.name}
                  >
                    <Icon className={badge.color} size={20} />
                  </motion.button>
                );
              })
            ) : (
              <p className="text-gray-400 italic text-xs">Chưa có huy hiệu nào. Hãy bắt đầu học nhé!</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, profile, role, loading, selectProfile, deleteProfile, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'learn' | 'report' | 'settings' | 'games' | 'editorial'>('learn');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [learningConfig, setLearningConfig] = useState<{ mode: 'practice' | 'quiz', difficulty?: 'easy' | 'medium' | 'hard', topicId?: string } | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'profile' | 'account' | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmedDeletion = async () => {
    if (!showDeleteConfirm || isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      if (showDeleteConfirm === 'profile' && profile) {
        await deleteProfile(profile.id);
      } else if (showDeleteConfirm === 'account') {
        await deleteAccount();
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.warn('Account settings deletion failed:', error instanceof Error ? error.message : 'unknown');
      setDeleteError(showDeleteConfirm === 'profile'
        ? describeProfileDeletionError(error)
        : 'Chưa xóa được tài khoản. Máy chủ xóa tài khoản có thể chưa được triển khai; dữ liệu vẫn được giữ nguyên.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="animate-bounce text-4xl font-bold text-orange-500">Đang tải...</div>
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        // Silently ignore or log for debugging
        console.log('Login popup closed by user');
      } else {
        console.error('Login failed:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-md w-full border-4 border-orange-200"
        >
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={48} className="text-orange-500" />
          </div>
          <h1 className="text-4xl font-black text-orange-600 mb-4">Học Vui Tiểu Học</h1>
          <p className="text-gray-600 mb-8 text-lg">Chào mừng bé đến với thế giới học tập đầy thú vị!</p>
          <button
            onClick={handleLogin}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg"
          >
            <img src="https://www.gstatic.com/firebase/builtwith/google.svg" alt="Google" className="w-6 h-6 bg-white p-1 rounded-full" />
            Đăng nhập để bắt đầu
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSelector />;
  }

  const updateGrade = async (newGrade: number) => {
    if (!profile || !user || !Number.isInteger(newGrade) || newGrade < 1 || newGrade > 5) return;
    const userRef = doc(db, 'users', user.uid, 'profiles', profile.id);
    await updateDoc(userRef, { grade: newGrade });
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => selectProfile(null)}
              className="bg-orange-500 p-2 rounded-xl text-white hover:bg-orange-600 transition-colors"
              title="Đổi hồ sơ"
            >
              <UserIcon size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Học Vui Lớp {profile?.grade}</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            {profile?.favoriteBadge && (
              <div 
                className={`${BADGES[profile.favoriteBadge as BadgeId]?.bgColor} p-1.5 rounded-lg border border-white shadow-sm hidden md:block`}
                title={`Huy hiệu yêu thích: ${BADGES[profile.favoriteBadge as BadgeId]?.name}`}
              >
                {React.createElement(BADGES[profile.favoriteBadge as BadgeId].icon, { 
                  className: BADGES[profile.favoriteBadge as BadgeId].color, 
                  size: 20 
                })}
              </div>
            )}
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
              <Star size={18} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-yellow-700">{profile?.totalPoints || 0}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <Trophy size={18} className="text-blue-500" />
              <span className="font-bold text-blue-700">Cấp {profile?.level || 1}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {selectedSubject ? (
            <motion.div
              key={learningConfig ? 'learning' : activeGame ? 'game' : 'subject-detail'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {learningConfig ? (
                <LearningModule 
                  subject={selectedSubject} 
                  grade={profile?.grade || 2} 
                  onClose={() => setLearningConfig(null)}
                  mode={learningConfig.mode}
                  initialDifficulty={learningConfig.difficulty}
                  topicId={learningConfig.topicId}
                />
              ) : activeGame ? (
                <GameModule 
                  initialGame={activeGame as any} 
                  onClose={() => setActiveGame(null)} 
                />
              ) : (
                <SubjectDetailView 
                  subject={selectedSubject}
                  onBack={() => setSelectedSubject(null)}
                  onStartLearning={(mode, difficulty, topicId) => setLearningConfig({ mode, difficulty, topicId })}
                  onPlayGame={(gameType) => setActiveGame(gameType)}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activeTab === 'learn' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Chào bé, {profile?.displayName}!</h2>
                    <p className="text-gray-600">Hôm nay bé muốn học môn gì nào?</p>
                    <p className="text-xs text-orange-700 mt-3">Lớp {profile?.grade} · {CURRICULUM_META.academicYear} · SGK {CURRICULUM_META.textbook}</p>
                  </div>

                  <ProgressWidget profile={profile} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getGradeSubjects(profile?.grade || 2).map(subject => (
                      <SubjectCard key={subject} subject={subject} onClick={() => setSelectedSubject(subject)} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'report' && <ReportModule />}

              {activeTab === 'games' && <GameModule />}

              {activeTab === 'editorial' && <EditorialAdmin />}

              {activeTab === 'settings' && (
                <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Trình độ lớp</label>
                      <select 
                        value={profile?.grade}
                        onChange={(e) => updateGrade(Number(e.target.value))}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      >
                        {[1, 2, 3, 4, 5].map(g => (
                          <option key={g} value={g}>Lớp {g}</option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-gray-400 italic">
                        * Chọn lớp đang học để hệ thống lọc môn và chủ đề phù hợp; chỉ hỗ trợ lớp 1–5.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Tên hiển thị: <span className="font-bold text-gray-800">{profile?.displayName}</span></p>
                      <p className="text-sm text-gray-500">Email: <span className="font-bold text-gray-800">{profile?.email}</span></p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 space-y-4">
                      <button 
                        onClick={() => { setDeleteError(null); setShowDeleteConfirm('profile'); }}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold border border-red-100"
                      >
                        <Trash2 size={18} />
                        Chuyển hồ sơ vào Thùng rác
                      </button>
                      <button 
                        onClick={() => { setDeleteError(null); setShowDeleteConfirm('account'); }}
                        className="w-full flex items-center justify-center gap-2 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-xs font-medium"
                      >
                        Xóa toàn bộ tài khoản và dữ liệu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full text-center border-4 border-red-100"
                    >
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} className="text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {showDeleteConfirm === 'profile' ? 'Chuyển vào Thùng rác?' : 'Xóa tài khoản?'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {showDeleteConfirm === 'profile' 
                          ? 'Hồ sơ sẽ được giữ trong Thùng rác 30 ngày, có thể khôi phục điểm, huy hiệu và lịch sử học tập.' 
                          : 'Tất cả hồ sơ và dữ liệu học tập sẽ biến mất mãi mãi. Bé có chắc không?'}
                      </p>
                      {deleteError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{deleteError}</p>}
                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => { void handleConfirmedDeletion(); }}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition-colors disabled:cursor-wait disabled:opacity-60"
                        >
                          {isDeleting ? 'Đang xử lý trên Firebase...' : showDeleteConfirm === 'profile' ? 'Chuyển vào Thùng rác' : 'Đồng ý xóa'}
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => { setDeleteError(null); setShowDeleteConfirm(null); }}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-colors disabled:opacity-50"
                        >
                          Quay lại
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!selectedSubject && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 px-4 py-3 flex justify-around items-center z-10">
          <button 
            onClick={() => setActiveTab('learn')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'learn' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-xs font-bold">Học tập</span>
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'report' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <BarChart3 size={24} />
            <span className="text-xs font-bold">Báo cáo</span>
          </button>
          <button 
            onClick={() => setActiveTab('games')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'games' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <Gamepad2 size={24} />
            <span className="text-xs font-bold">Trò chơi</span>
          </button>
          {(role === 'admin' || role === 'reviewer') && <button onClick={() => setActiveTab('editorial')} className={`flex flex-col items-center gap-1 ${activeTab === 'editorial' ? 'text-indigo-600' : 'text-gray-400'}`}><GraduationCap size={24}/><span className="text-xs font-bold">Duyệt bài</span></button>}
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <Settings size={24} />
            <span className="text-xs font-bold">Cài đặt</span>
          </button>
        </nav>
      )}
      <AIChatbot />
      <BackgroundMusic />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
