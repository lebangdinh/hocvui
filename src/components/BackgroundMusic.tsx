import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Volume2, VolumeX, Pause, Play } from 'lucide-react';

const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3'; // Cheerful music

export const BackgroundMusic: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Autoplay blocked', e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-blue-100 flex items-center gap-4"
          >
            <button
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVolume(v => v === 0 ? 0.3 : 0)}
                className="text-slate-400 hover:text-blue-500 transition-colors"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowControls(!showControls)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isPlaying 
            ? 'bg-blue-500 text-white animate-pulse' 
            : 'bg-white text-slate-400 border border-slate-100'
        }`}
      >
        <Music size={24} />
      </motion.button>
    </div>
  );
};
