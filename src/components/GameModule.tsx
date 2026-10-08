import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Puzzle, 
  Car, 
  Target, 
  Plane, 
  Shield, 
  ChevronLeft,
  Play,
  Trophy,
  Star,
  Users,
  User
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { BADGES } from '../constants/badges';
import confetti from 'canvas-confetti';
import { GameSceneArt, type GameArtType } from './GameSceneArt';
import { drawRacingTrack, drawRacingCar } from './RacingArt';
import { drawArcadeBackground, drawArcadeHero, drawArcadeEnemy, drawArcadeProjectile } from './ArcadeArt';

const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  finish: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  bg: 'https://assets.mixkit.co/music/preview/mixkit-happy-and-joyful-15.mp3',
  move: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  shoot: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Soft pop sound
  explosion: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Magic sparkle sound
  gameOver: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  flip: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3'
};

const playSound = (type: keyof typeof SOUNDS) => {
  const audio = new Audio(SOUNDS[type]);
  const volumes: Record<string, number> = {
    bg: 0.05,
    shoot: 0.1,
    explosion: 0.1,
    gameOver: 0.15,
    correct: 0.2,
    incorrect: 0.1,
    finish: 0.2,
    move: 0.1,
    flip: 0.15
  };
  audio.volume = volumes[type] || 0.2;
  if (type === 'bg') audio.loop = true;
  audio.play().catch(e => console.log('Audio play failed:', e));
  return audio;
};

type GameType = 'puzzle' | 'racing' | 'chicken' | 'airplane' | 'tank' | 'memory' | null;

interface Theme {
  id: string;
  name: string;
  bgClass: string;
  cardBg: string;
  accentColor: string;
  gameBg: string;
  textColor: string;
  secondaryTextColor: string;
}

const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Ban ngày',
    bgClass: 'bg-blue-50',
    cardBg: 'bg-white',
    accentColor: 'blue',
    gameBg: '#f8fafc',
    textColor: 'text-gray-800',
    secondaryTextColor: 'text-gray-500'
  },
  {
    id: 'dark',
    name: 'Ban đêm',
    bgClass: 'bg-slate-900',
    cardBg: 'bg-slate-800',
    accentColor: 'indigo',
    gameBg: '#0f172a',
    textColor: 'text-white',
    secondaryTextColor: 'text-slate-400'
  },
  {
    id: 'candy',
    name: 'Kẹo ngọt',
    bgClass: 'bg-pink-50',
    cardBg: 'bg-white',
    accentColor: 'pink',
    gameBg: '#fff1f2',
    textColor: 'text-pink-900',
    secondaryTextColor: 'text-pink-500'
  },
  {
    id: 'forest',
    name: 'Rừng xanh',
    bgClass: 'bg-emerald-50',
    cardBg: 'bg-white',
    accentColor: 'emerald',
    gameBg: '#ecfdf5',
    textColor: 'text-emerald-900',
    secondaryTextColor: 'text-emerald-600'
  },
  {
    id: 'space',
    name: 'Vũ trụ',
    bgClass: 'bg-black',
    cardBg: 'bg-gray-900',
    accentColor: 'purple',
    gameBg: '#000000',
    textColor: 'text-purple-100',
    secondaryTextColor: 'text-purple-400'
  }
];

interface GameCardProps {
  game: GameArtType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tag: string;
  onClick: () => void;
}

const GAME_ACCENTS: Record<GameArtType, { hex: string; soft: string; category: string }> = {
  puzzle: { hex: '#e96a2d', soft: '#fff1df', category: 'Tư duy logic' },
  chicken: { hex: '#ee628a', soft: '#fff0f5', category: 'Phản xạ nhanh' },
  airplane: { hex: '#347fe7', soft: '#e9f4ff', category: 'Phiêu lưu' },
  racing: { hex: '#10996d', soft: '#e4faef', category: 'Khéo léo' },
  tank: { hex: '#7667d9', soft: '#efedff', category: 'Thử thách' },
  memory: { hex: '#db4b98', soft: '#fff0f7', category: 'Ghi nhớ' }
};

const GameCard: React.FC<GameCardProps & { theme: Theme }> = ({
  game, title, description, icon, tag, onClick, theme
}) => {
  const accent = GAME_ACCENTS[game];
  const dark = theme.id === 'dark' || theme.id === 'space';
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -7, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 270, damping: 20 }}
      aria-label={`Chơi ${title}`}
      className="group relative flex flex-col overflow-hidden rounded-[28px] text-left shadow-[0_12px_28px_rgba(31,41,55,0.10)] hover:shadow-[0_20px_40px_rgba(31,41,55,0.19)] focus-visible:outline focus-visible:outline-[4px] focus-visible:outline-offset-4 focus-visible:outline-orange-500"
      style={{ backgroundColor: dark ? '#202c47' : '#fff', border: dark ? '1px solid #465272' : '1px solid rgba(255,255,255,.85)' }}
    >
      <div className="relative aspect-[1.85/1] w-full overflow-hidden">
        <GameSceneArt type={game} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.06]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1 text-[11px] font-black tracking-wide text-slate-700 shadow-sm backdrop-blur">
          {tag}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: accent.soft, color: accent.hex }}>
            {icon}
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: accent.hex }}>
            {accent.category}
          </span>
        </div>
        <h3 className={`mb-1 text-[21px] font-black leading-tight tracking-tight ${dark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
        <p className={`min-h-12 text-[13px] leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{description}</p>
        <span
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-white shadow-md transition-transform group-hover:translate-x-1"
          style={{ backgroundColor: accent.hex }}
        >
          Chơi ngay <Play size={13} fill="currentColor" />
        </span>
      </div>
    </motion.button>
  );
};

const colors = [
  { name: 'Đỏ rực', value: '#ef4444' },
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Xanh lá', value: '#22c55e' },
  { name: 'Vàng chanh', value: '#eab308' },
  { name: 'Tím mộng mơ', value: '#a855f7' },
  { name: 'Hồng phấn', value: '#ec4899' },
  { name: 'Cam sành', value: '#f97316' },
  { name: 'Xám bạc', value: '#94a3b8' },
  { name: 'Đen huyền bí', value: '#1e293b' },
  { name: 'Trắng tinh khôi', value: '#f8fafc' },
  { name: 'Nâu đất', value: '#78350f' },
  { name: 'Xanh lơ', value: '#06b6d4' }
];

const patterns = [
  { id: 'none', name: 'Trơn' },
  { id: 'stripes', name: 'Sọc kẻ' },
  { id: 'dots', name: 'Chấm bi' },
  { id: 'flames', name: 'Ngọn lửa' },
  { id: 'lightning', name: 'Tia chớp' }
];

// --- Simple Puzzle Game ---
// Easy, no-fail replacement for the sliding puzzle. Tap 12 friendly stars.
const StarCatchGame = ({ theme }: { theme: Theme }) => {
  const GOAL = 12;
  const [started, setStarted] = useState(false);
  const [caught, setCaught] = useState(0);
  const [starPosition, setStarPosition] = useState({ x: 50, y: 50 });
  const [combo, setCombo] = useState(0);
  const { addPoints, awardBadge } = useAuth();
  const awarded = React.useRef(false);

  const nextPosition = React.useCallback(() => {
    // Keep a large target entirely inside the board. No timers or penalties.
    setStarPosition({ x: 16 + Math.random() * 68, y: 19 + Math.random() * 60 });
  }, []);

  const restart = () => {
    awarded.current = false;
    setCaught(0);
    setCombo(0);
    setStarted(true);
    nextPosition();
  };

  useEffect(() => {
    if (caught !== GOAL || awarded.current) return;
    awarded.current = true;
    void addPoints(30).catch(error => console.warn('Unable to award star points:', error));
    void awardBadge('puzzle_master').catch(error => console.warn('Unable to award star badge:', error));
    confetti({ particleCount: 85, spread: 85, origin: { y: .65 },
      colors: ['#ffcd56', '#fd83ae', '#74d5f6', '#93e7b5'] });
  }, [caught, addPoints, awardBadge]);

  const collectStar = () => {
    if (!started || caught >= GOAL) return;
    playSound('correct');
    setCaught(value => Math.min(GOAL, value + 1));
    setCombo(value => value + 1);
    nextPosition();
  };

  return (
    <div className="mx-auto flex w-full max-w-[580px] flex-col items-center gap-5 py-2">
      {!started ? (
        <div className="flex flex-col items-center gap-5 py-8 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-[36px] bg-gradient-to-br from-yellow-200 to-orange-400 shadow-[0_12px_28px_rgba(238,158,53,.26)]">
            <Star size={66} fill="#fff9c7" stroke="#fff" strokeWidth={2.5}/>
          </div>
          <h3 className={`text-3xl font-black ${theme.textColor}`}>Bắt Sao Vui Nhộn</h3>
          <p className="max-w-sm text-center text-sm font-medium text-slate-500">Chạm vào 12 ngôi sao lấp lánh. Không giới hạn thời gian, không bị thua. Dành cho cả bé lớp 1!</p>
          <button type="button" onClick={restart} className="rounded-full bg-orange-500 px-9 py-4 text-lg font-black text-white shadow-lg hover:bg-orange-600">🌟 Bắt đầu nào!</button>
        </div>
      ) : (
        <>
          <div className="flex w-full items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
            <span className="text-lg font-black text-amber-700">⭐ {caught} / {GOAL}</span>
            <span className="text-sm font-bold text-orange-500">{caught === GOAL ? 'Hoàn thành rồi!' : 'Chạm vào sao nhé!'}</span>
            <button type="button" onClick={restart} className="rounded-full bg-white px-3 py-2 text-xs font-black text-amber-700 shadow">Chơi lại</button>
          </div>
          <div className="relative w-full overflow-hidden rounded-[32px] border-[5px] border-white bg-gradient-to-b from-sky-300 via-indigo-200 to-pink-200 shadow-[0_18px_45px_rgba(76,88,150,.19)]" style={{aspectRatio: '1 / .85'}}>
            <div aria-hidden="true" className="absolute inset-0">
              {[...Array(18)].map((_, i) => (
                <span key={i} className="absolute rounded-full bg-white/65"
                  style={{ left:`${(i * 37) % 95}%`, top:`${(i * 53) % 86}%`, height:i%4===0?7:4, width:i%4===0?7:4 }}/>
              ))}
              <div className="absolute -bottom-20 -left-12 h-48 w-72 rounded-full bg-violet-400/30 blur-2xl"/>
              <div className="absolute -bottom-12 -right-10 h-40 w-64 rounded-full bg-pink-400/35 blur-xl"/>
            </div>
            {caught < GOAL ? (
              <motion.button
                key={combo}
                type="button"
                aria-label="Bắt ngôi sao"
                initial={{ scale: .3, opacity: 0, rotate: -45 }}
                animate={{ scale: [1, 1.08, 1], opacity: 1, rotate: [0, 8, 0] }}
                transition={{ duration: .55 }}
                whileTap={{ scale: .77 }}
                onClick={collectStar}
                className="absolute flex h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-white/20 shadow-[0_0_28px_rgba(255,240,152,.85)] outline-offset-4 focus-visible:outline-4 focus-visible:outline-orange-500 sm:h-[94px] sm:w-[94px]"
                style={{left: `${starPosition.x}%`, top: `${starPosition.y}%`}}
              >
                <Star size={70} fill="#ffe56d" stroke="#ffffff" strokeWidth={2.5} className="drop-shadow-[0_5px_6px_rgba(241,148,40,.45)]"/>
              </motion.button>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 px-5 text-center backdrop-blur-sm">
                <div className="text-7xl">🏆</div>
                <h4 className="mt-2 text-3xl font-black text-indigo-800">Bé giỏi quá!</h4>
                <p className="mt-2 font-bold text-indigo-700">Bắt đủ 12 ngôi sao và được thưởng 30 điểm!</p>
                <button type="button" onClick={restart} className="mt-5 rounded-full bg-orange-500 px-8 py-3 font-black text-white shadow-lg">Chơi thêm nhé! ⭐</button>
              </div>
            )}
          </div>
          <p className="text-center text-xs font-medium text-slate-500">Bé chỉ cần chạm vào sao hoặc dùng chuột nhấn vào sao.</p>
        </>
      )}
    </div>
  );
};

const ShooterGame = ({ type, theme }: { type: 'chicken' | 'airplane' | 'tank', theme: Theme }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<'single' | 'multi' | null>(null);
  const shakeRef = React.useRef(0);
  const keys = React.useRef<Record<string, boolean>>({});
  const holdKey = (key: string, down: boolean) => { keys.current[key] = down; };
  const { addPoints, awardBadge } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault();
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameOver) {
      const totalScore = score + score2;
      const points = Math.floor(totalScore / 2); // Award half the score as persistent points
      if (points > 0) addPoints(points);
      
      if (totalScore >= 500) {
        awardBadge('shooter_hero');
        playSound('finish');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#f59e0b', '#ef4444']
        });
      }
    }
  }, [gameOver, score, score2]);

  React.useEffect(() => {
    if (!started || gameOver || !mode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let player1X = canvas.width / (mode === 'multi' ? 3 : 2);
    let player2X = canvas.width * 2 / 3;
    const playerY = canvas.height - 60;
    const bullets: { x: number, y: number, player: number }[] = [];
    const enemies: { x: number, y: number, speed: number, size: number, color: string, type: string }[] = [];
    const particles: { x: number, y: number, vx: number, vy: number, life: number, color: string }[] = [];
    const stars: { x: number, y: number, size: number, speed: number, alpha: number }[] = [];
    
    // Initialize stars with layers
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: i < 20 ? 2.5 : i < 50 ? 1.5 : 0.8,
        speed: i < 20 ? 3 : i < 50 ? 1.5 : 0.5,
        alpha: i < 20 ? 0.8 : i < 50 ? 0.5 : 0.3
      });
    }

    let frameCount = 0;
    let muzzleFlash1 = 0;
    let muzzleFlash2 = 0;
    let lastShot1 = 0;
    let lastShot2 = 0;

    const createExplosion = (x: number, y: number, color: string) => {
      shakeRef.current = 15;
      playSound('explosion');
      
      // Flash effect
      particles.push({
        x, y, vx: 0, vy: 0, life: 0.3, color: 'rgba(255, 255, 255, 0.8)', size: 40, type: 'flash'
      } as any);

      // Main explosion particles
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.8 + Math.random() * 0.4,
          color: i % 3 === 0 ? color : i % 3 === 1 ? '#fbbf24' : '#fff',
          size: 3 + Math.random() * 4,
          type: 'spark'
        } as any);
      }

      // Smoke particles
      for (let i = 0; i < 10; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 1.2 + Math.random() * 0.5,
          color: 'rgba(100, 116, 139, 0.5)',
          size: 10 + Math.random() * 10,
          type: 'smoke'
        } as any);
      }
    };

    const drawPlayer = (x: number, y: number, playerIndex: number) => {
      drawArcadeHero(ctx, type, x, y, playerIndex, frameCount);
    };

    const drawEnemy = (enemy: { x: number; y: number; size: number }) => {
      drawArcadeEnemy(ctx, type, enemy.x, enemy.y, enemy.size, frameCount);
    };

    const gameLoop = () => {
      frameCount++;
      if (shakeRef.current > 0) shakeRef.current -= 1;

      // Handle Keyboard Input
      if (mode === 'single') {
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) player1X = Math.max(30, player1X - 5);
        if (keys.current['ArrowRight'] || keys.current['KeyD']) player1X = Math.min(canvas.width - 30, player1X + 5);
        if ((keys.current['Space'] || keys.current['ArrowUp'] || keys.current['KeyW']) && frameCount - lastShot1 > 15) {
          bullets.push({ x: player1X, y: playerY - 10, player: 1 });
          muzzleFlash1 = 3;
          lastShot1 = frameCount;
          playSound('shoot');
        }
      } else {
        // Player 1 (A/D/W)
        if (keys.current['KeyA']) player1X = Math.max(30, player1X - 5);
        if (keys.current['KeyD']) player1X = Math.min(canvas.width - 30, player1X + 5);
        if ((keys.current['KeyW'] || keys.current['Space']) && frameCount - lastShot1 > 15) {
          bullets.push({ x: player1X, y: playerY - 10, player: 1 });
          muzzleFlash1 = 3;
          lastShot1 = frameCount;
          playSound('shoot');
        }
        // Player 2 (Arrows/Enter)
        if (keys.current['ArrowLeft']) player2X = Math.max(30, player2X - 5);
        if (keys.current['ArrowRight']) player2X = Math.min(canvas.width - 30, player2X + 5);
        if ((keys.current['ArrowUp'] || keys.current['Enter']) && frameCount - lastShot2 > 15) {
          bullets.push({ x: player2X, y: playerY - 10, player: 2 });
          muzzleFlash2 = 3;
          lastShot2 = frameCount;
          playSound('shoot');
        }
      }

      ctx.save();
      if (shakeRef.current > 0) {
        ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
      }
      
      drawArcadeBackground(ctx, type, canvas.width, canvas.height, frameCount);

      // Draw Players
      drawPlayer(player1X, playerY, 1);
      if (mode === 'multi') drawPlayer(player2X, playerY, 2);

      // Muzzle Flashes
      [muzzleFlash1, muzzleFlash2].forEach((flash, i) => {
        if (flash > 0) {
          ctx.save();
          ctx.translate(i === 0 ? player1X : player2X, playerY - 25);
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
          grad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (i === 0) muzzleFlash1--; else muzzleFlash2--;
        }
      });

      // Spawn Enemies
      if (frameCount % 80 === 0) {
        enemies.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -30,
          speed: 0.8 + Math.random() * 1.2,
          size: 20 + Math.random() * 15,
          color: type === 'chicken' ? '#fef08a' : '#ef4444',
          type: type
        });
      }

      // Update & Draw Bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 6;
        drawArcadeProjectile(ctx, bullets[i].x, bullets[i].y, bullets[i].player, frameCount);
        if (bullets[i].y < 0) bullets.splice(i, 1);
      }

      // Update & Draw Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        drawEnemy(enemies[i]);

        // Collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
          const dist = Math.sqrt((enemies[i].x - bullets[j].x) ** 2 + (enemies[i].y - bullets[j].y) ** 2);
          if (dist < enemies[i].size + 15) {
            createExplosion(enemies[i].x, enemies[i].y, enemies[i].color);
            if (bullets[j].player === 1) setScore(s => s + 10);
            else setScore2(s => s + 10);
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            break;
          }
        }

        if (enemies[i] && enemies[i].y > canvas.height) {
          setGameOver(true);
          playSound('gameOver');
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i] as any;
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size || 2, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(gameLoop);
      ctx.restore();
    };

    const handleInput = (clientX: number, rect: DOMRect) => {
      if (mode === 'multi') return;
      const x = (clientX - rect.left) * canvas.width / rect.width;
      player1X = Math.max(30, Math.min(canvas.width - 30, x));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      handleInput(e.clientX, rect);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e.cancelable) e.preventDefault();
      handleInput(e.touches[0].clientX, rect);
    };

    const handleClick = () => {
      if (mode === 'multi') return;
      bullets.push({ x: player1X, y: playerY - 10, player: 1 });
      muzzleFlash1 = 3;
      playSound('shoot');
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('click', handleClick);

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [started, gameOver, type, mode]);

  if (!mode) {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className={`w-24 h-24 bg-${theme.accentColor}-100 rounded-full flex items-center justify-center text-${theme.accentColor}-500`}>
          {type === 'chicken' ? <Target size={48} /> : type === 'airplane' ? <Plane size={48} /> : <Shield size={48} />}
        </div>
        <div className="text-center">
          <h3 className={`text-2xl font-black ${theme.textColor}`}>Chọn chế độ chơi</h3>
          <p className={`${theme.secondaryTextColor} mt-1`}>Bé muốn chơi một mình hay cùng bạn?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <button 
            onClick={() => setMode('single')}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-4 border-blue-100 hover:border-blue-500 transition-all bg-white group`}
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <User size={32} />
            </div>
            <span className="font-bold text-lg text-gray-700">Một người chơi</span>
          </button>
          <button 
            onClick={() => setMode('multi')}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-4 border-purple-100 hover:border-purple-500 transition-all bg-white group`}
          >
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <span className="font-bold text-lg text-gray-700">Hai người chơi</span>
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="text-center">
          <h3 className={`text-2xl font-black ${theme.textColor}`}>Sẵn sàng chưa bé?</h3>
          {mode === 'single' ? (
            <p className={`${theme.secondaryTextColor} mt-1`}>Dùng chuột hoặc phím mũi tên để di chuyển nhé!</p>
          ) : (
            <div className={`mt-4 space-y-2 text-sm ${theme.secondaryTextColor}`}>
              <p><span className="font-bold text-blue-500">Người 1:</span> Phím A, D để di chuyển, W để bắn</p>
              <p><span className="font-bold text-purple-500">Người 2:</span> Phím mũi tên để di chuyển, Enter để bắn</p>
            </div>
          )}
        </div>
        <button 
          onClick={() => setStarted(true)}
          className={`bg-${theme.accentColor}-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all`}
        >
          Bắt đầu chơi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[480px] items-center rounded-2xl bg-sky-50 px-4 py-3 border border-sky-100">
        {mode === 'single' ? (
          <div className={`text-lg font-black text-${theme.accentColor}-500`}>⭐ Điểm: {score}</div>
        ) : (
          <div className="flex justify-between w-full">
            <div className="text-sm font-black text-blue-500">Người 1: {score}</div>
            <div className="text-sm font-black text-purple-500">Người 2: {score2}</div>
          </div>
        )}
        {gameOver && <button onClick={() => { setGameOver(false); setScore(0); setScore2(0); }} className="text-sm font-bold text-blue-500">Chơi lại</button>}
      </div>
      <div className="relative w-full max-w-[480px] aspect-[4/5] touch-none">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={500} 
          className={`rounded-3xl border-[5px] border-white shadow-[0_22px_60px_rgba(14,48,83,.24)] w-full h-full object-contain ${theme.id === 'space' ? 'ring-2 ring-purple-500/50' : ''}`}
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center text-white p-6 text-center">
            <h3 className="text-3xl font-black mb-2">Hết lượt!</h3>
            {mode === 'single' ? (
              <p className="text-xl mb-6">Bé đã đạt được {score} điểm.</p>
            ) : (
              <div className="mb-6">
                <p className="text-xl font-bold text-yellow-400 mb-2">
                  {score > score2 ? 'Người 1 Thắng!' : score2 > score ? 'Người 2 Thắng!' : 'Hòa nhau rồi!'}
                </p>
                <div className="flex gap-4 justify-center text-sm opacity-80">
                  <span>P1: {score}</span>
                  <span>P2: {score2}</span>
                </div>
              </div>
            )}
            <button 
              onClick={() => { setGameOver(false); setScore(0); setScore2(0); setStarted(false); setMode(null); }}
              className={`bg-${theme.accentColor}-500 px-8 py-3 rounded-2xl font-bold`}
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
      <div className="flex w-full max-w-[480px] items-center gap-3 select-none">
        <button aria-label="Di chuyển sang trái" type="button"
          onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); holdKey(mode === 'single' ? 'ArrowLeft' : 'KeyA', true); }}
          onPointerUp={() => holdKey(mode === 'single' ? 'ArrowLeft' : 'KeyA', false)}
          onPointerCancel={() => holdKey(mode === 'single' ? 'ArrowLeft' : 'KeyA', false)}
          onLostPointerCapture={() => holdKey(mode === 'single' ? 'ArrowLeft' : 'KeyA', false)}
          className="flex-1 rounded-2xl bg-sky-500 py-4 text-2xl font-black text-white shadow-[0_5px_0_#2360a4] active:translate-y-1 active:shadow-none touch-none">◀</button>
        <button aria-label="Bắn tia sáng" type="button"
          onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); holdKey(mode === 'single' ? 'Space' : 'KeyW', true); }}
          onPointerUp={() => holdKey(mode === 'single' ? 'Space' : 'KeyW', false)}
          onPointerCancel={() => holdKey(mode === 'single' ? 'Space' : 'KeyW', false)}
          onLostPointerCapture={() => holdKey(mode === 'single' ? 'Space' : 'KeyW', false)}
          className="flex-[1.4] rounded-2xl bg-amber-400 py-4 text-lg font-black text-amber-950 shadow-[0_5px_0_#c38319] active:translate-y-1 active:shadow-none touch-none">✨ BẮN</button>
        <button aria-label="Di chuyển sang phải" type="button"
          onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); holdKey(mode === 'single' ? 'ArrowRight' : 'KeyD', true); }}
          onPointerUp={() => holdKey(mode === 'single' ? 'ArrowRight' : 'KeyD', false)}
          onPointerCancel={() => holdKey(mode === 'single' ? 'ArrowRight' : 'KeyD', false)}
          onLostPointerCapture={() => holdKey(mode === 'single' ? 'ArrowRight' : 'KeyD', false)}
          className="flex-1 rounded-2xl bg-sky-500 py-4 text-2xl font-black text-white shadow-[0_5px_0_#2360a4] active:translate-y-1 active:shadow-none touch-none">▶</button>
      </div>
      {mode === 'multi' && <p className="text-center text-xs text-slate-500">Người 2 dùng phím ← → và Enter trên bàn phím.</p>}
    </div>
  );
};

// --- Enhanced Racing Game ---
const RacingGame = ({ theme }: { theme: Theme }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<'single' | 'multi' | null>(null);
  const [carColor, setCarColor] = useState('#ef4444');
  const [carPattern, setCarPattern] = useState<'none' | 'stripes' | 'dots' | 'flames' | 'lightning'>('stripes');
  const [carColor2, setCarColor2] = useState('#3b82f6');
  const [carPattern2, setCarPattern2] = useState<'none' | 'stripes' | 'dots' | 'flames' | 'lightning'>('dots');
  const [customizingPlayer, setCustomizingPlayer] = useState(1);
  const moveButton = (key: string, pressed: boolean) => { keys.current[key] = pressed; };
  const keys = React.useRef<Record<string, boolean>>({});
  const { addPoints, awardBadge } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameOver) {
      const totalScore = score + score2;
      const points = totalScore * 5; // Award 5 points per meter
      if (points > 0) addPoints(points);
      
      if (score >= 1000 || score2 >= 1000) {
        awardBadge('racing_star');
        playSound('finish');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6']
        });
      }
    }
  }, [gameOver, score, score2]);

  React.useEffect(() => {
    if (!started || gameOver || !mode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let player1X = canvas.width / (mode === 'multi' ? 3 : 2);
    let player2X = canvas.width * 2 / 3;
    let isP1Alive = true;
    let isP2Alive = mode === 'multi';
    const playerY = canvas.height - 100;
    const obstacles: { x: number, y: number, speed: number, color: string, type: number }[] = [];
    const particles: { x: number, y: number, vx: number, vy: number, life: number, color: string }[] = [];
    let frameCount = 0;
    let roadOffset = 0;

    const drawCar = (x: number, y: number, color: string, pattern: string, isPlayer: boolean) => {
      drawRacingCar(ctx, x, y, color, pattern, isPlayer, frameCount);
    };

    const gameLoop = () => {
      frameCount++;
      roadOffset += 8;

      // Handle Keyboard Input
      if (mode === 'single') {
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) player1X = Math.max(87, player1X - 6);
        if (keys.current['ArrowRight'] || keys.current['KeyD']) player1X = Math.min(canvas.width - 87, player1X + 6);
      } else {
        // Player 1 (A/D)
        if (isP1Alive) {
          if (keys.current['KeyA']) player1X = Math.max(87, player1X - 6);
          if (keys.current['KeyD']) player1X = Math.min(canvas.width - 87, player1X + 6);
        }
        // Player 2 (Arrows)
        if (isP2Alive) {
          if (keys.current['ArrowLeft']) player2X = Math.max(87, player2X - 6);
          if (keys.current['ArrowRight']) player2X = Math.min(canvas.width - 87, player2X + 6);
        }
      }

      // Layered cartoon track with moving shoulders, foliage and racing curbs.
      drawRacingTrack(ctx, canvas.width, canvas.height, roadOffset, frameCount, theme.id);
      // Count actual distance over time, not just the number of traffic cars passed.
      if (frameCount % 8 === 0) {
        if (isP1Alive) setScore(m => m + 3);
        if (isP2Alive) setScore2(m => m + 3);
      }

      // Bright traffic enters one of three lanes. Difficulty rises gently.
      if (frameCount % 76 === 0) {
        const lanes = [117, canvas.width / 2, canvas.width - 117];
        const lane = Math.floor(Math.random() * lanes.length);
        obstacles.push({
          x: lanes[lane],
          y: -90,
          speed: 4.3 + Math.min(3, frameCount / 2200) + Math.random() * 1.2,
          color: ['#ffc857', '#8e82ec', '#ff8199', '#5fd1e3'][Math.floor(Math.random() * 4)],
          type: Math.floor(Math.random() * 3)
        });
      }

      // Update & Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacles[i].speed;
        drawCar(obstacles[i].x, obstacles[i].y, obstacles[i].color, 'none', false);

        // Collision detection
        const checkCollision = (px: number) => {
          return Math.abs(px - obstacles[i].x) < 35 && Math.abs(playerY - obstacles[i].y) < 55;
        };

        if (isP1Alive && checkCollision(player1X)) {
          isP1Alive = false;
          playSound('explosion');
          if (mode === 'single' || !isP2Alive) {
            setGameOver(true);
            playSound('gameOver');
          }
        }
        
        if (isP2Alive && checkCollision(player2X)) {
          isP2Alive = false;
          playSound('explosion');
          if (!isP1Alive) {
            setGameOver(true);
            playSound('gameOver');
          }
        }

        if (obstacles[i].y > canvas.height) {
          obstacles.splice(i, 1);

        }
      }

      // Draw Players
      if (isP1Alive) drawCar(player1X, playerY, carColor, carPattern, true);
      if (isP2Alive) drawCar(player2X, playerY, carColor2, carPattern2, true);

      // Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.02;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleInput = (clientX: number, rect: DOMRect) => {
      if (mode === 'multi') return;
      const x = clientX - rect.left;
      player1X = Math.max(87, Math.min(canvas.width - 87, x));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      handleInput(e.clientX, rect);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      handleInput(e.touches[0].clientX, rect);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [started, gameOver, carColor, carPattern, mode]);

  if (!mode) {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className={`w-24 h-24 bg-${theme.accentColor}-100 rounded-full flex items-center justify-center text-${theme.accentColor}-500`}>
          <Car size={48} />
        </div>
        <div className="text-center">
          <h3 className={`text-2xl font-black ${theme.textColor}`}>Chọn chế độ đua</h3>
          <p className={`${theme.secondaryTextColor} mt-1`}>Bé muốn đua một mình hay cùng bạn?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <button 
            onClick={() => setMode('single')}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-4 border-blue-100 hover:border-blue-500 transition-all bg-white group`}
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <User size={32} />
            </div>
            <span className="font-bold text-lg text-gray-700">Một người chơi</span>
          </button>
          <button 
            onClick={() => setMode('multi')}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-4 border-purple-100 hover:border-purple-500 transition-all bg-white group`}
          >
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <span className="font-bold text-lg text-gray-700">Hai người chơi</span>
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    const isP1 = customizingPlayer === 1;
    const currentColor = isP1 ? carColor : carColor2;
    const currentPattern = isP1 ? carPattern : carPattern2;
    const setCurrentColor = isP1 ? setCarColor : setCarColor2;
    const setCurrentPattern = isP1 ? setCarPattern : setCarPattern2;

    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="text-center">
          <h3 className={`text-2xl font-black ${theme.textColor}`}>
            {mode === 'multi' ? `Người chơi ${customizingPlayer}: Trang trí xe` : 'Trang trí xe của bé'}
          </h3>
          <p className={`${theme.secondaryTextColor} mt-1`}>Chọn màu sắc và họa tiết bé thích nhất nhé!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Preview */}
          <div className="w-48 h-64 bg-slate-800 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-xl border-4 border-slate-700">
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'linear-gradient(#fff 2px, transparent 2px), linear-gradient(90deg, #fff 2px, transparent 2px)',
              backgroundSize: '20px 20px'
            }} />
            <div className="scale-150">
              {/* Simple Car Preview */}
              <div className="relative w-12 h-20">
                <div className="absolute inset-0 rounded-lg shadow-lg" style={{ backgroundColor: currentColor }}>
                  {/* Pattern Preview */}
                  {currentPattern === 'stripes' && <div className="absolute inset-0 opacity-30 flex justify-around px-1"><div className="w-1 h-full bg-black"/><div className="w-1 h-full bg-black"/></div>}
                  {currentPattern === 'dots' && <div className="absolute inset-0 opacity-30 flex flex-wrap gap-1 p-1"><div className="w-1 h-1 bg-black rounded-full"/><div className="w-1 h-1 bg-black rounded-full"/><div className="w-1 h-1 bg-black rounded-full"/></div>}
                </div>
                <div className="absolute top-2 left-2 right-2 h-6 bg-slate-900/80 rounded" />
                <div className="absolute -left-2 top-4 w-2 h-4 bg-black rounded" />
                <div className="absolute -right-2 top-4 w-2 h-4 bg-black rounded" />
                <div className="absolute -left-2 bottom-4 w-2 h-4 bg-black rounded" />
                <div className="absolute -right-2 bottom-4 w-2 h-4 bg-black rounded" />
              </div>
            </div>
          </div>

          <div className="space-y-6 w-full max-w-xs">
            <div>
              <label className={`block text-sm font-bold mb-2 ${theme.textColor}`}>Màu sắc:</label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCurrentColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${currentColor === c.value ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-70'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-bold mb-2 ${theme.textColor}`}>Họa tiết:</label>
              <div className="grid grid-cols-3 gap-2">
                {patterns.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentPattern(p.id as any)}
                    className={`text-[10px] py-2 px-1 rounded-lg border-2 font-bold transition-all ${currentPattern === p.id ? `bg-${theme.accentColor}-500 text-white border-${theme.accentColor}-600` : 'bg-white text-gray-600 border-gray-100'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {mode === 'multi' && customizingPlayer === 1 ? (
            <button 
              onClick={() => setCustomizingPlayer(2)}
              className={`bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all`}
            >
              Tiếp theo (Người 2)
            </button>
          ) : (
            <button 
              onClick={() => setStarted(true)}
              className={`bg-${theme.accentColor}-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all`}
            >
              Sẵn sàng!
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between w-full max-w-[480px] items-center px-4 rounded-2xl bg-gradient-to-r from-sky-50 to-amber-50 py-3 border border-sky-100">
        {mode === 'single' ? (
          <div className={`text-lg font-black text-${theme.accentColor}-500`}>🏁 Quãng đường: {score}m</div>
        ) : (
          <div className="flex justify-between w-full">
            <div className="text-sm font-black text-blue-500">Người 1: {score}m</div>
            <div className="text-sm font-black text-purple-500">Người 2: {score2}m</div>
          </div>
        )}
        {gameOver && <button onClick={() => { setGameOver(false); setScore(0); setScore2(0); }} className="text-sm font-bold text-blue-500">Chơi lại</button>}
      </div>
      <div className="relative w-full max-w-[480px] aspect-[4/5] touch-none">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={500} 
          className="bg-sky-200 rounded-3xl shadow-[0_22px_60px_rgba(14,48,83,.25)] border-[5px] border-white w-full h-full object-contain"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center text-white p-6 text-center">
            <h3 className="text-3xl font-black mb-2">🏁 Hoàn thành lượt đua!</h3>
            {mode === 'single' ? (
              <p className="text-xl mb-6">Bé đã đi được {score} mét.</p>
            ) : (
              <div className="mb-6">
                <p className="text-xl font-bold text-yellow-400 mb-2">
                  {score > score2 ? 'Người 1 Thắng!' : score2 > score ? 'Người 2 Thắng!' : 'Hòa nhau rồi!'}
                </p>
                <div className="flex gap-4 justify-center text-sm opacity-80">
                  <span>P1: {score}m</span>
                  <span>P2: {score2}m</span>
                </div>
              </div>
            )}
            <button 
              onClick={() => { setGameOver(false); setScore(0); setScore2(0); }}
              className={`bg-${theme.accentColor}-500 px-8 py-3 rounded-2xl font-bold`}
            >
              Đua lại
            </button>
          </div>
        )}
      </div>
      <div className="flex w-full max-w-[480px] justify-between gap-3 select-none">
        <button type="button" aria-label={mode === 'single' ? 'Rẽ trái' : 'Người 1 rẽ trái'}
          onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); moveButton(mode === 'single' ? 'ArrowLeft' : 'KeyA', true); }}
          onPointerUp={() => moveButton(mode === 'single' ? 'ArrowLeft' : 'KeyA', false)}
          onPointerCancel={() => moveButton(mode === 'single' ? 'ArrowLeft' : 'KeyA', false)}
          onLostPointerCapture={() => moveButton(mode === 'single' ? 'ArrowLeft' : 'KeyA', false)}
          className="flex-1 rounded-2xl bg-sky-500 py-4 text-2xl font-black text-white shadow-[0_5px_0_#2360a4] active:translate-y-1 active:shadow-none touch-none">◀</button>
        {mode === 'multi' && <span className="self-center text-xs font-black text-slate-500">P1 • P2: phím ← →</span>}
        <button type="button" aria-label={mode === 'single' ? 'Rẽ phải' : 'Người 1 rẽ phải'}
          onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); moveButton(mode === 'single' ? 'ArrowRight' : 'KeyD', true); }}
          onPointerUp={() => moveButton(mode === 'single' ? 'ArrowRight' : 'KeyD', false)}
          onPointerCancel={() => moveButton(mode === 'single' ? 'ArrowRight' : 'KeyD', false)}
          onLostPointerCapture={() => moveButton(mode === 'single' ? 'ArrowRight' : 'KeyD', false)}
          className="flex-1 rounded-2xl bg-sky-500 py-4 text-2xl font-black text-white shadow-[0_5px_0_#2360a4] active:translate-y-1 active:shadow-none touch-none">▶</button>
      </div>
      <div className="text-center text-sm opacity-70">
        {mode === 'single' ? (
          <p>Dùng chuột hoặc phím mũi tên để lái xe nhé!</p>
        ) : (
          <div className="space-y-1">
            <p><span className="font-bold text-blue-500">Người 1:</span> Phím A, D để lái</p>
            <p><span className="font-bold text-purple-500">Người 2:</span> Phím mũi tên để lái</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Memory Match Game ---
const MemoryGame = ({ theme }: { theme: Theme }) => {
  const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [started, setStarted] = useState(false);
  const { addPoints, awardBadge } = useAuth();

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

  const [mismatchIndices, setMismatchIndices] = useState<number[]>([]);
  const flipTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flipTimer.current) clearTimeout(flipTimer.current); }, []);

  const initGame = () => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
    if (flipTimer.current) clearTimeout(flipTimer.current);
    flipTimer.current = null;
    setCards(deck);
    setFlippedIndices([]);
    setMismatchIndices([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev => prev.map((card, i) => 
          (i === first || i === second) ? { ...card, matched: true } : card
        ));
        setFlippedIndices([]);
        playSound('correct');
      } else {
        setMismatchIndices([first, second]);
        playSound('incorrect');
        flipTimer.current = setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            (i === first || i === second) ? { ...card, flipped: false } : card
          ));
          setFlippedIndices([]);
          setMismatchIndices([]);
        }, 1000);
      }
      setMoves(m => m + 1);
    }
  }, [flippedIndices]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setIsWon(true);
      addPoints(100);
      awardBadge('memory_master');
      playSound('finish');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f59e0b', '#3b82f6']
      });
    }
  }, [cards]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].flipped || cards[index].matched || isWon) return;

    setCards(prev => prev.map((card, i) => i === index ? { ...card, flipped: true } : card));
    setFlippedIndices(prev => [...prev, index]);
    playSound('flip');
  };

  return (
    <div className="flex flex-col items-center gap-6 relative overflow-hidden p-8">
      {!started ? (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className={`w-24 h-24 bg-${theme.accentColor}-100 rounded-full flex items-center justify-center text-${theme.accentColor}-500`}>
            <Star size={48} />
          </div>
          <div className="text-center">
            <h3 className={`text-2xl font-black ${theme.textColor}`}>Thử thách trí nhớ</h3>
            <p className={`${theme.secondaryTextColor} mt-1`}>Tìm các cặp hình giống nhau để chiến thắng nhé!</p>
          </div>
          <button 
            onClick={() => setStarted(true)}
            className={`bg-${theme.accentColor}-500 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all`}
          >
            Bắt đầu chơi
          </button>
        </div>
      ) : (
        <>
          {/* Floating Background Particles */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
                className={`absolute w-4 h-4 bg-${theme.accentColor}-200 rounded-full blur-xl`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="flex justify-between w-full max-w-[460px] items-center relative z-10 rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3">
            <div className={`text-sm font-bold ${theme.secondaryTextColor}`}>🃏 Lượt lật: <span className={`text-${theme.accentColor}-500`}>{moves}</span></div>
            <button onClick={initGame} className="text-xs font-bold text-blue-500 hover:underline">Chơi lại</button>
          </div>

          <div className="grid w-full max-w-[460px] grid-cols-4 gap-2 rounded-[28px] border-4 border-pink-100 bg-gradient-to-br from-rose-50 to-violet-100 p-3 shadow-[0_18px_42px_rgba(115,70,140,.16)] sm:gap-3 sm:p-4">
            {cards.map((card, i) => {
              const visible = card.flipped || card.matched;
              const colors = [
                'linear-gradient(145deg,#f9a8d4,#e468a9)',
                'linear-gradient(145deg,#93c5fd,#6c77db)',
                'linear-gradient(145deg,#fde68a,#f59e66)',
                'linear-gradient(145deg,#a7f3d0,#4dc8a1)'
              ];
              return <motion.button
                key={card.id}
                type="button"
                aria-label={visible ? 'Hình ' + card.emoji : 'Lật thẻ số ' + (i + 1)}
                disabled={card.matched || isWon || flippedIndices.length === 2}
                whileHover={!visible ? { y: -4, scale: 1.05 } : {}}
                whileTap={!visible ? { scale: .94 } : {}}
                animate={card.matched ? { scale: [1, 1.08, 1] } : mismatchIndices.includes(i) ? { x: [-4,4,-4,4,0] } : {}}
                transition={{ duration: .24 }}
                onClick={() => handleCardClick(i)}
                className="relative aspect-[.81] w-full min-w-0 overflow-hidden rounded-[15px] border-[3px] border-white shadow-[0_6px_0_rgba(83,69,114,.22)] transition-[filter] focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-500 sm:rounded-[20px]"
                style={{ background: visible ? 'linear-gradient(145deg,#ffffff,#fdf0fc)' : colors[i % 4] }}
              >
                <span className="absolute left-1.5 top-1.5 h-4 w-5 rotate-[-35deg] rounded-full bg-white/45" />
                {visible ?
                  <>
                    <span className="relative text-[27px] drop-shadow-sm sm:text-[40px]">{card.emoji}</span>
                    {card.matched && <span className="absolute bottom-1 right-1 rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white">✓</span>}
                  </>
                  : <span className="relative flex h-full w-full items-center justify-center"><Star size={31} strokeWidth={2.7} className="text-white drop-shadow-md" fill="rgba(255,255,255,.4)" /></span>
                }
              </motion.button>;
            })}
          </div>

          {isWon && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <Trophy className="text-yellow-500 mx-auto mb-2" size={48} />
              <h3 className={`text-2xl font-black ${theme.textColor}`}>Tuyệt vời!</h3>
              <p className={theme.secondaryTextColor}>Bé đã hoàn thành trong {moves} bước.</p>
              <button 
                onClick={initGame}
                className={`mt-4 bg-${theme.accentColor}-500 text-white px-6 py-2 rounded-xl font-bold`}
              >
                Chơi lại
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export const GameModule: React.FC<{ initialGame?: GameType, onClose?: () => void }> = ({ initialGame, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<GameType>(initialGame || null);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const bgMusic = playSound('bg');
    return () => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    };
  }, []);

  return (
    <div className={`relative space-y-8 p-4 sm:p-7 rounded-[32px] sm:rounded-[40px] transition-colors duration-500 ${currentTheme.bgClass} overflow-hidden`}>
      {/* Parallax Background Elements for Space/Dark Themes */}
      {(currentTheme.id === 'space' || currentTheme.id === 'dark') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: mousePos.x * (i % 3 + 1),
                y: mousePos.y * (i % 3 + 1),
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                x: { type: "spring", damping: 20 },
                y: { type: "spring", damping: 20 },
                opacity: { duration: 3 + Math.random() * 2, repeat: Infinity },
                scale: { duration: 4 + Math.random() * 2, repeat: Infinity }
              }}
              className={`absolute rounded-full bg-white`}
              style={{
                width: Math.random() * 4 + 1 + 'px',
                height: Math.random() * 4 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                filter: 'blur(1px)'
              }}
            />
          ))}
          {currentTheme.id === 'space' && (
            <>
              <motion.div 
                animate={{ 
                  x: mousePos.x * 0.5,
                  y: mousePos.y * 0.5,
                  rotate: 360
                }}
                transition={{ 
                  x: { type: "spring", damping: 30 },
                  y: { type: "spring", damping: 30 },
                  rotate: { duration: 100, repeat: Infinity, ease: "linear" }
                }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"
              />
              <motion.div 
                animate={{ 
                  x: mousePos.x * 0.8,
                  y: mousePos.y * 0.8,
                  rotate: -360
                }}
                transition={{ 
                  x: { type: "spring", damping: 30 },
                  y: { type: "spring", damping: 30 },
                  rotate: { duration: 120, repeat: Infinity, ease: "linear" }
                }}
                className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"
              />
            </>
          )}
        </div>
      )}

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          {onClose && !selectedGame && (
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl ${currentTheme.cardBg} ${currentTheme.secondaryTextColor} hover:text-${currentTheme.accentColor}-500 shadow-sm transition-all`}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="text-center sm:text-left">
            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">🎉 THẾ GIỚI GAME CỦA BÉ</p>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${currentTheme.textColor} mb-2`}>Khu Vui Chơi</h2>
            <p className={currentTheme.secondaryTextColor}>6 trò chơi sắc màu · Rèn phản xạ, trí nhớ và tư duy</p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className={`flex items-center gap-2 p-2 ${currentTheme.cardBg} rounded-2xl shadow-sm border border-gray-100`}>
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setCurrentTheme(theme)}
              className={`w-8 h-8 rounded-lg transition-all border-2 ${
                currentTheme.id === theme.id ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              style={{ backgroundColor: theme.gameBg }}
              title={theme.name}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedGame ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
          >
            <GameCard 
              title="Bắt Sao Vui Nhộn"
              description="Chạm vào những ngôi sao lấp lánh, chơi vui không sợ thua!"
              icon={<Puzzle size={21} strokeWidth={2.6} />}
              color="orange"
              onClick={() => setSelectedGame('puzzle')}
              game="puzzle"
              tag="Dễ chơi · Lớp 1–5"
              theme={currentTheme}
            />
            <GameCard 
              title="Bắn Gà Vui Nhộn"
              description="Thử thách phản xạ nhanh nhẹn của bé."
              icon={<Target size={21} strokeWidth={2.6} />}
              color="red"
              onClick={() => setSelectedGame('chicken')}
              game="chicken"
              tag="Gà con vui nhộn"
              theme={currentTheme}
            />
            <GameCard 
              title="Phi Đội Gà Bay"
              description="Lái phi thuyền vượt thử thách giữa các vì sao."
              icon={<Plane size={21} strokeWidth={2.6} />}
              color="blue"
              onClick={() => setSelectedGame('airplane')}
              game="airplane"
              tag="Khám phá bầu trời"
              theme={currentTheme}
            />
            <GameCard 
              title="Đua Xe Tốc Độ"
              description="Lái xe vượt qua các chướng ngại vật."
              icon={<Car size={21} strokeWidth={2.6} />}
              color="green"
              onClick={() => setSelectedGame('racing')}
              game="racing"
              tag="Tay lái siêu nhí"
              theme={currentTheme}
            />
            <GameCard 
              title="Robot Vệ Binh"
              description="Thử phản xạ và bảo vệ căn cứ trong thế giới robot."
              icon={<Shield size={21} strokeWidth={2.6} />}
              color="indigo"
              onClick={() => setSelectedGame('tank')}
              game="tank"
              tag="Thử tài khéo léo"
              theme={currentTheme}
            />
            <GameCard 
              title="Thử Thách Trí Nhớ"
              description="Tìm các cặp hình giống nhau để chiến thắng."
              icon={<Star size={21} strokeWidth={2.6} />}
              color="pink"
              onClick={() => setSelectedGame('memory')}
              game="memory"
              tag="Luyện trí nhớ"
              theme={currentTheme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`${currentTheme.cardBg} p-8 rounded-[40px] shadow-sm border border-${currentTheme.accentColor}-100`}
          >
            <button 
              onClick={() => {
                if (selectedGame) {
                  setSelectedGame(null);
                } else if (onClose) {
                  onClose();
                }
              }}
              className={`flex items-center gap-2 ${currentTheme.secondaryTextColor} hover:text-${currentTheme.accentColor}-500 transition-colors mb-8 font-bold`}
            >
              <ChevronLeft size={20} />
              Quay lại {onClose && !initialGame ? 'khu vui chơi' : 'trang chủ'}
            </button>

            {selectedGame && (
              <div className="relative mb-7 h-28 overflow-hidden rounded-[24px] sm:h-36">
                <GameSceneArt type={selectedGame} className="h-full w-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/15 to-transparent" />
                <div className="absolute inset-y-0 left-5 flex flex-col justify-center sm:left-7">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.19em] text-white/85">✨ Sẵn sàng thử sức?</span>
                  <span className="mt-1 text-xl font-black text-white drop-shadow-md sm:text-2xl">
                    {{ puzzle: 'Bắt Sao Vui Nhộn', chicken: 'Bắn Gà Vui Nhộn', airplane: 'Phi Đội Gà Bay', racing: 'Đua Xe Tốc Độ', tank: 'Robot Vệ Binh', memory: 'Thử Thách Trí Nhớ' }[selectedGame]}
                  </span>
                </div>
              </div>
            )}

            {selectedGame === 'puzzle' && <StarCatchGame theme={currentTheme} />}
            {(selectedGame === 'chicken' || selectedGame === 'airplane' || selectedGame === 'tank') && (
              <ShooterGame type={selectedGame as 'chicken' | 'airplane' | 'tank'} theme={currentTheme} />
            )}
            {selectedGame === 'racing' && <RacingGame theme={currentTheme} />}
            {selectedGame === 'memory' && <MemoryGame theme={currentTheme} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
