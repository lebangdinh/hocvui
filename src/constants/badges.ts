import { Trophy, Star, Zap, Heart, Flame, Shield, FlaskConical, Globe, Monitor } from 'lucide-react';

export const BADGES = {
  first_lesson: {
    id: 'first_lesson',
    name: 'Người Mới',
    description: 'Hoàn thành bài học đầu tiên',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100'
  },
  perfect_score: {
    id: 'perfect_score',
    name: 'Điểm Tuyệt Đối',
    description: 'Đạt 100% điểm trong một bài học',
    icon: Trophy,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100'
  },
  math_master: {
    id: 'math_master',
    name: 'Chuyên Gia Toán',
    description: 'Hoàn thành 5 bài học môn Toán',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  vietnamese_master: {
    id: 'vietnamese_master',
    name: 'Chuyên Gia Tiếng Việt',
    description: 'Hoàn thành 5 bài học môn Tiếng Việt',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  },
  english_master: {
    id: 'english_master',
    name: 'Chuyên Gia Tiếng Anh',
    description: 'Hoàn thành 5 bài học môn Tiếng Anh',
    icon: Flame,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  },
  science_master: {
    id: 'science_master',
    name: 'Chuyên Gia Khoa Học',
    description: 'Hoàn thành 5 bài học môn Khoa Học',
    icon: FlaskConical,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100'
  },
  history_geo_master: {
    id: 'history_geo_master',
    name: 'Chuyên Gia Sử Địa',
    description: 'Hoàn thành 5 bài học môn Sử Địa',
    icon: Globe,
    color: 'text-red-500',
    bgColor: 'bg-red-100'
  },
  it_master: {
    id: 'it_master',
    name: 'Chuyên Gia Tin Học',
    description: 'Hoàn thành 5 bài học môn Tin Học',
    icon: Monitor,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100'
  },
  diligent: {
    id: 'diligent',
    name: 'Chăm Chỉ',
    description: 'Hoàn thành tổng cộng 10 bài học',
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100'
  },
  puzzle_master: {
    id: 'puzzle_master',
    name: 'Thợ Săn Sao',
    description: 'Bắt đủ 12 ngôi sao trong trò Bắt Sao Vui Nhộn',
    icon: Star,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-100'
  },
  shooter_hero: {
    id: 'shooter_hero',
    name: 'Anh Hùng Phi Thuyền',
    description: 'Đạt 500 điểm trong trò chơi bắn súng',
    icon: Zap,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100'
  },
  racing_star: {
    id: 'racing_star',
    name: 'Tay Đua Cừ Khôi',
    description: 'Đạt 1000 điểm trong trò chơi đua xe',
    icon: Trophy,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100'
  },
  memory_master: {
    id: 'memory_master',
    name: 'Siêu Nhớ Siêu Phàm',
    description: 'Hoàn thành trò chơi trí nhớ',
    icon: Zap,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100'
  }
};

export type BadgeId = keyof typeof BADGES;
