import React, { useEffect, useRef, useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { useSoundPreferences } from '../services/soundPreferences';
import { SoundControls } from './SoundControls';

// A single music player for the whole app prevents two overlapping tracks.
const MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3';

export const BackgroundMusic: React.FC = () => {
  const pref = useSoundPreferences();
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.preload = 'none';
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(.15, pref.musicVolume);
    if (!pref.music || pref.musicVolume <= 0) audio.pause();
    else void audio.play().catch(() => {
      // Browser autoplay restrictions are normal; user can enable via settings.
    });
  }, [pref.music, pref.musicVolume]);

  return (
    <div className="fixed bottom-5 left-4 z-50 flex max-w-[calc(100vw-32px)] flex-col items-start gap-2">
      {expanded && <SoundControls />}
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        aria-label={expanded ? 'Đóng cài đặt âm thanh' : 'Mở cài đặt âm thanh'}
        title="Cài đặt âm thanh"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-lg hover:bg-blue-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-500"
      >
        {expanded ? <X size={22}/> : <Settings2 size={22}/>}
      </button>
    </div>
  );
};
