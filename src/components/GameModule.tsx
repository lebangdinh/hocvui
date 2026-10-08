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
const PuzzleGame = ({ theme }: { theme: Theme }) => {
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [started, setStarted] = useState(false);

  const { addPoints, awardBadge } = useAuth();

  useEffect(() => {
    if (started) {
      shuffle();
    }
  }, [started]);

  useEffect(() => {
    if (isWon) {
      addPoints(50);
      awardBadge('puzzle_master');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#f59e0b', '#22c55e']
      });
    }
  }, [isWon]);

  // Generate only solvable puzzles by walking from the completed board.
  const shuffle = () => {
    const board = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let previousBlank = -1;
    for (let step = 0; step < 80; step++) {
      const blank = board.indexOf(0);
      const row = Math.floor(blank / 3);
      const col = blank % 3;
      const neighbors = [
        ...(row > 0 ? [blank - 3] : []),
        ...(row < 2 ? [blank + 3] : []),
        ...(col > 0 ? [blank - 1] : []),
        ...(col < 2 ? [blank + 1] : [])
      ].filter(index => index !== previousBlank);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      [board[blank], board[next]] = [board[next], board[blank]];
      previousBlank = blank;
    }
    setTiles(board);
    setMoves(0);
    setIsWon(false);
  };

  const moveTile = (index: number) => {
    if (isWon) return;
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
                      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);
      playSound('move');
      
      if (newTiles.every((t, i) => t === (i + 1) % 9)) {
        setIsWon(true);
        playSound('finish');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {!started ? (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className={`w-24 h-24 bg-${theme.accentColor}-100 rounded-full flex items-center justify-center text-${theme.accentColor}-500`}>
            <Puzzle size={48} />
          </div>
          <div className="text-center">
            <h3 className={`text-2xl font-black ${theme.textColor}`}>Xếp hình trí tuệ</h3>
            <p className={`${theme.secondaryTextColor} mt-1`}>Sắp xếp các ô số theo thứ tự từ 1 đến 8 nhé!</p>
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
          <div className="flex justify-between w-full max-w-[300px] items-center">
            <div className="text-sm font-bold text-gray-500">Số bước: <span className="text-orange-500">{moves}</span></div>
            <button onClick={shuffle} className="text-xs font-bold text-blue-500 hover:underline">Trộn lại</button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-2 rounded-2xl shadow-inner">
            {tiles.map((tile, i) => (
              <motion.button
                key={i}
                layout
                whileHover={tile !== 0 ? { scale: 1.05, zIndex: 10 } : {}}
                whileTap={tile !== 0 ? { scale: 0.95 } : {}}
                animate={tile !== 0 ? (tile === (i + 1) % 9 ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 2 } } : { scale: 1 }) : {}}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => moveTile(i)}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black transition-all relative overflow-hidden ${
                  tile === 0 
                    ? 'bg-gray-200/50 shadow-inner' 
                    : 'bg-white text-orange-500 shadow-[0_6px_0_0_rgba(249,115,22,0.2)] border-2 border-orange-100'
                } ${tile !== 0 && tile === (i + 1) % 9 ? 'ring-4 ring-green-400 ring-inset' : ''}`}
              >
                {tile !== 0 && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 animate-[shine_3s_infinite] pointer-events-none" />
                    {tile}
                  </>
                )}
              </motion.button>
            ))}
          </div>

          {isWon && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <Trophy className="text-yellow-500 mx-auto mb-2" size={48} />
              <h3 className="text-2xl font-black text-green-600">Tuyệt vời!</h3>
              <p className="text-gray-500">Bé đã hoàn thành trong {moves} bước.</p>
              <button 
                onClick={shuffle}
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

const ShooterGame = ({ type, theme }: { type: 'chicken' | 'airplane' | 'tank', theme: Theme }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<'single' | 'multi' | null>(null);
  const shakeRef = React.useRef(0);
  const keys = React.useRef<Record<string, boolean>>({});
  const { addPoints, awardBadge } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
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
      ctx.save();
      ctx.translate(x, y);
      
      // Add a subtle glow to the player
      ctx.shadowBlur = 15;
      ctx.shadowColor = playerIndex === 1 ? (type === 'tank' ? '#22c55e' : '#3b82f6') : '#a855f7';

      if (type === 'tank') {
        // Tank Body
        const grad = ctx.createLinearGradient(-22, 0, 22, 0);
        const baseColor = playerIndex === 1 ? '#22c55e' : '#a855f7';
        const darkColor = playerIndex === 1 ? '#166534' : '#6b21a8';
        grad.addColorStop(0, darkColor);
        grad.addColorStop(0.3, baseColor);
        grad.addColorStop(0.7, baseColor);
        grad.addColorStop(1, darkColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(-22, 0, 44, 30, 8);
        ctx.fill();
        
        // Camouflage pattern
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(-15, 5, 10, 10);
        ctx.fillRect(5, 15, 12, 8);
        
        // Turret
        const tGrad = ctx.createRadialGradient(0, 5, 0, 0, 5, 15);
        tGrad.addColorStop(0, baseColor);
        tGrad.addColorStop(1, darkColor);
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.arc(0, 5, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Barrel with details
        ctx.fillStyle = darkColor;
        ctx.fillRect(-5, -20, 10, 25);
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -22, 12, 5); // Muzzle brake
        
        // Tracks detail
        ctx.fillStyle = '#111';
        ctx.fillRect(-25, 5, 10, 25);
        ctx.fillRect(15, 5, 10, 25);
      } else {
        // Spaceship/Airplane - More futuristic
        const grad = ctx.createLinearGradient(-25, 0, 25, 0);
        const baseColor = playerIndex === 1 ? '#60a5fa' : '#d8b4fe';
        const darkColor = playerIndex === 1 ? '#1e40af' : '#7e22ce';
        grad.addColorStop(0, darkColor);
        grad.addColorStop(0.5, baseColor);
        grad.addColorStop(1, darkColor);
        ctx.fillStyle = grad;
        
        // Wings with detail
        ctx.beginPath();
        ctx.moveTo(-30, 25);
        ctx.lineTo(30, 25);
        ctx.lineTo(0, -15);
        ctx.closePath();
        ctx.fill();
        
        // Wing tips
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-32, 20, 4, 8);
        ctx.fillRect(28, 20, 4, 8);
        
        // Body
        const bGrad = ctx.createLinearGradient(0, -20, 0, 30);
        bGrad.addColorStop(0, '#f8fafc');
        bGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.ellipse(0, 5, 10, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cockpit with reflection
        const cGrad = ctx.createRadialGradient(-2, -8, 0, 0, -5, 8);
        cGrad.addColorStop(0, '#bae6fd');
        cGrad.addColorStop(1, '#0ea5e9');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(0, -5, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine fire - Multi-layered
        if (frameCount % 4 < 3) {
          // Outer flame
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(-8, 30);
          ctx.lineTo(8, 30);
          ctx.lineTo(0, 45 + Math.random() * 15);
          ctx.fill();
          
          // Inner flame
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(-4, 30);
          ctx.lineTo(4, 30);
          ctx.lineTo(0, 38 + Math.random() * 8);
          ctx.fill();
        }

        // Shield Visual
        ctx.strokeStyle = playerIndex === 1 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = frameCount;
        ctx.beginPath();
        ctx.arc(0, 5, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    };

    const drawEnemy = (enemy: any) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      
      // Subtle enemy glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = enemy.color;

      if (type === 'chicken') {
        const grad = ctx.createRadialGradient(-enemy.size/3, -enemy.size/3, 2, 0, 0, enemy.size);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.2, '#fef08a');
        grad.addColorStop(0.8, '#eab308');
        grad.addColorStop(1, '#a16207');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fef08a';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(-enemy.size * 0.8, 0, enemy.size/2, enemy.size/3, Math.PI/4, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(enemy.size * 0.8, 0, enemy.size/2, enemy.size/3, -Math.PI/4, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#ef4444';
        for(let i = -2; i <= 2; i++) {
          const xOffset = i * 4;
          const yOffset = -enemy.size + Math.abs(i) * 2;
          const radius = 5 - Math.abs(i);
          ctx.beginPath();
          ctx.arc(xOffset, yOffset, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(14, 4);
        ctx.lineTo(0, 6);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-6, -4, 5, 0, Math.PI * 2);
        ctx.arc(6, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-6, -4, 3, 0, Math.PI * 2);
        ctx.arc(6, -4, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const grad = ctx.createRadialGradient(0, -5, 2, 0, 0, enemy.size);
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(0.6, '#ef4444');
        grad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, enemy.size, enemy.size / 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const glassGrad = ctx.createLinearGradient(0, -enemy.size/2, 0, 0);
        glassGrad.addColorStop(0, '#fee2e2');
        glassGrad.addColorStop(1, '#f87171');
        ctx.fillStyle = glassGrad;
        ctx.beginPath();
        ctx.arc(0, -4, enemy.size/2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
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
      
      ctx.fillStyle = theme.gameBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Stars
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
        ctx.globalAlpha = star.alpha + Math.sin(frameCount * 0.05 + star.x) * 0.2;
        ctx.fillStyle = theme.id === 'light' || theme.id === 'candy' ? 'rgba(0,0,0,0.1)' : '#fff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

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
        const bGrad = ctx.createRadialGradient(bullets[i].x, bullets[i].y, 0, bullets[i].x, bullets[i].y, 12);
        bGrad.addColorStop(0, bullets[i].player === 1 ? '#fbbf24' : '#d8b4fe');
        bGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bullets[i].x, bullets[i].y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bullets[i].x, bullets[i].y, 5, 0, Math.PI * 2);
        ctx.fill();
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
      const x = clientX - rect.left;
      player1X = Math.max(30, Math.min(canvas.width - 30, x));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      handleInput(e.clientX, rect);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
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
      <div className="flex justify-between w-full max-w-[400px] items-center px-4">
        {mode === 'single' ? (
          <div className={`text-lg font-black text-${theme.accentColor}-500`}>Điểm: {score}</div>
        ) : (
          <div className="flex justify-between w-full">
            <div className="text-sm font-black text-blue-500">Người 1: {score}</div>
            <div className="text-sm font-black text-purple-500">Người 2: {score2}</div>
          </div>
        )}
        {gameOver && <button onClick={() => { setGameOver(false); setScore(0); setScore2(0); }} className="text-sm font-bold text-blue-500">Chơi lại</button>}
      </div>
      <div className="relative w-full max-w-[400px] aspect-[4/5] touch-none">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={500} 
          className={`bg-gray-900 rounded-3xl shadow-2xl w-full h-full object-contain ${theme.id === 'space' ? 'ring-2 ring-purple-500/50' : ''}`}
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
  const keys = React.useRef<Record<string, boolean>>({});
  const { addPoints, awardBadge } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
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
      ctx.save();
      ctx.translate(x, y);
      
      // Dust effect for player
      if (isPlayer && frameCount % 5 === 0) {
        particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + 50,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 2,
          life: 0.5,
          color: 'rgba(255, 255, 255, 0.3)'
        });
      }

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.roundRect(-20, 8, 40, 60, 12);
      ctx.fill();

      // Body - More aerodynamic shape
      const grad = ctx.createLinearGradient(-18, 0, 18, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(0.3, '#fff');
      grad.addColorStop(0.7, '#fff');
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-18, 0, 36, 55, 10);
      ctx.fill();

      // Patterns
      ctx.save();
      ctx.clip();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      if (pattern === 'stripes') {
        for(let i=0; i<5; i++) ctx.fillRect(-20 + i*10, 0, 4, 60);
      } else if (pattern === 'dots') {
        for(let i=0; i<10; i++) {
          ctx.beginPath();
          ctx.arc((Math.random()-0.5)*30, Math.random()*50, 3, 0, Math.PI*2);
          ctx.fill();
        }
      } else if (pattern === 'flames') {
        ctx.fillStyle = 'rgba(255,100,0,0.4)';
        ctx.beginPath();
        ctx.moveTo(-15, 55);
        ctx.lineTo(-10, 30); ctx.lineTo(-5, 45); ctx.lineTo(0, 20);
        ctx.lineTo(5, 45); ctx.lineTo(10, 30); ctx.lineTo(15, 55);
        ctx.fill();
      } else if (pattern === 'lightning') {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 10); ctx.lineTo(-10, 25); ctx.lineTo(5, 25); ctx.lineTo(-5, 45);
        ctx.stroke();
      }
      ctx.restore();

      // Windows
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-14, 10, 28, 15, 4); // Front
      ctx.roundRect(-14, 35, 28, 10, 2); // Back
      ctx.fill();
      
      // Window shine
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(-10, 12, 4, 8);

      // Lights
      ctx.fillStyle = '#fff'; // Front lights
      ctx.beginPath();
      ctx.arc(-12, 5, 4, 0, Math.PI * 2);
      ctx.arc(12, 5, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Light glow
      const lGrad = ctx.createRadialGradient(-12, 5, 0, -12, 5, 15);
      lGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
      lGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lGrad;
      ctx.beginPath(); ctx.arc(-12, 5, 15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(12, 5, 15, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#ef4444'; // Rear lights
      ctx.fillRect(-14, 50, 6, 3);
      ctx.fillRect(8, 50, 6, 3);

      // Wheels
      ctx.fillStyle = '#111';
      ctx.fillRect(-22, 10, 6, 12);
      ctx.fillRect(16, 10, 6, 12);
      ctx.fillRect(-22, 35, 6, 12);
      ctx.fillRect(16, 35, 6, 12);

      ctx.restore();
    };

    const gameLoop = () => {
      frameCount++;
      roadOffset = (roadOffset + 8) % 100;

      // Handle Keyboard Input
      if (mode === 'single') {
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) player1X = Math.max(80, player1X - 6);
        if (keys.current['ArrowRight'] || keys.current['KeyD']) player1X = Math.min(canvas.width - 80, player1X + 6);
      } else {
        // Player 1 (A/D)
        if (isP1Alive) {
          if (keys.current['KeyA']) player1X = Math.max(80, player1X - 6);
          if (keys.current['KeyD']) player1X = Math.min(canvas.width - 80, player1X + 6);
        }
        // Player 2 (Arrows)
        if (isP2Alive) {
          if (keys.current['ArrowLeft']) player2X = Math.max(80, player2X - 6);
          if (keys.current['ArrowRight']) player2X = Math.min(canvas.width - 80, player2X + 6);
        }
      }

      // Draw Road
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grass/Shoulders
      ctx.fillStyle = theme.id === 'space' ? '#0f172a' : '#15803d';
      ctx.fillRect(0, 0, 60, canvas.height);
      ctx.fillRect(canvas.width - 60, 0, 60, canvas.height);
      
      // Road lines
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = -roadOffset;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      
      // Side lines
      ctx.setLineDash([]);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(65, 0); ctx.lineTo(65, canvas.height);
      ctx.moveTo(canvas.width - 65, 0); ctx.lineTo(canvas.width - 65, canvas.height);
      ctx.stroke();

      // Spawn Obstacles
      if (frameCount % 60 === 0) {
        obstacles.push({
          x: Math.random() * (canvas.width - 160) + 80,
          y: -100,
          speed: 4 + Math.random() * 3,
          color: ['#1e293b', '#475569', '#94a3b8'][Math.floor(Math.random() * 3)],
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
          if (!gameOver) {
            if (isP1Alive) setScore(s => s + 1);
            if (isP2Alive) setScore2(s => s + 1);
          }
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
      player1X = Math.max(80, Math.min(canvas.width - 80, x));
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
      <div className="flex justify-between w-full max-w-[400px] items-center px-4">
        {mode === 'single' ? (
          <div className={`text-lg font-black text-${theme.accentColor}-500`}>Quãng đường: {score}m</div>
        ) : (
          <div className="flex justify-between w-full">
            <div className="text-sm font-black text-blue-500">Người 1: {score}m</div>
            <div className="text-sm font-black text-purple-500">Người 2: {score2}m</div>
          </div>
        )}
        {gameOver && <button onClick={() => { setGameOver(false); setScore(0); setScore2(0); }} className="text-sm font-bold text-blue-500">Chơi lại</button>}
      </div>
      <div className="relative w-full max-w-[400px] aspect-[4/5] touch-none">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={500} 
          className="bg-slate-800 rounded-3xl shadow-2xl w-full h-full object-contain"
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center text-white p-6 text-center">
            <h3 className="text-3xl font-black mb-2">Tai nạn rồi!</h3>
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

  const initGame = () => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
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
        setTimeout(() => {
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
          <div className="absolute inset-0 pointer-events-none">
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

          <div className="flex justify-between w-full max-w-[400px] items-center relative z-10">
            <div className={`text-sm font-bold ${theme.secondaryTextColor}`}>Số bước: <span className={`text-${theme.accentColor}-500`}>{moves}</span></div>
            <button onClick={initGame} className="text-xs font-bold text-blue-500 hover:underline">Chơi lại</button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, i) => (
              <motion.button
                key={card.id}
                whileHover={!card.flipped && !card.matched ? { scale: 1.05 } : {}}
                whileTap={!card.flipped && !card.matched ? { scale: 0.95 } : {}}
                animate={
                  card.matched 
                    ? { scale: [1, 1.2, 1], transition: { duration: 0.3 } }
                    : mismatchIndices.includes(i)
                    ? { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } }
                    : {}
                }
                onClick={() => handleCardClick(i)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex items-center justify-center text-3xl transition-all relative preserve-3d ${
                  card.flipped || card.matched
                    ? 'bg-white shadow-lg rotate-y-180'
                    : `bg-${theme.accentColor}-500 shadow-[0_6px_0_0_rgba(0,0,0,0.2)]`
                } ${card.matched ? `ring-4 ring-${theme.accentColor}-300 ring-offset-2` : ''}`}
              >
                <div className={`absolute inset-0 flex items-center justify-center backface-hidden ${card.flipped || card.matched ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="relative">
                    {card.emoji}
                    {card.matched && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`absolute -inset-2 bg-${theme.accentColor}-400/30 rounded-full blur-md`}
                      />
                    )}
                  </div>
                </div>
                <div className={`absolute inset-0 flex items-center justify-center backface-hidden ${card.flipped || card.matched ? 'opacity-0' : 'opacity-100'}`}>
                  <Star className="text-white/50" size={32} />
                </div>
              </motion.button>
            ))}
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
              title="Xếp Hình Trí Tuệ"
              description="Di chuyển những mảnh ghép, chinh phục bàn số 1–8."
              icon={<Puzzle size={21} strokeWidth={2.6} />}
              color="orange"
              onClick={() => setSelectedGame('puzzle')}
              game="puzzle"
              tag="Huy hiệu trí tuệ"
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
              title="Đại Chiến Xe Tăng"
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

            {selectedGame === 'puzzle' && <PuzzleGame theme={currentTheme} />}
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
