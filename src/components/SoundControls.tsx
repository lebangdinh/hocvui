import React from 'react';
import { useSoundPreferences, updateSoundPreferences } from '../services/soundPreferences';
import { CENTRAL_VOICE_READY } from '../services/voicePack';
import { Volume2, VolumeX, Music2, Sparkles, Mic, Speech } from 'lucide-react';

type SliderSetting = 'musicVolume' | 'effectsVolume' | 'praiseVolume';

const SLIDERS: { key: SliderSetting; label: string }[] = [
  { key: 'musicVolume', label: 'Nhạc nền' },
  { key: 'effectsVolume', label: 'Hiệu ứng' },
  { key: 'praiseVolume', label: 'Giọng khen' }
];

export const SoundControls: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const pref = useSoundPreferences();
  const toggles = [
    { key: 'music' as const, label: 'Nhạc nền', icon: <Music2 size={17}/> },
    { key: 'effects' as const, label: 'Hiệu ứng nhẹ', icon: <Sparkles size={17}/> },
    { key: 'praise' as const, label: 'Lời khen giọng nữ miền Trung', icon: <Mic size={17}/> },
    { key: 'explanation' as const, label: 'Đọc giải thích (giọng của máy)', icon: <Speech size={17}/> }
  ];
  return (
    <section className={`w-full rounded-2xl border border-sky-100 bg-white p-3 text-left shadow-sm ${compact ? 'max-w-[370px]' : 'max-w-[430px]'}`} aria-label="Cài đặt âm thanh Học Vui">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <Volume2 size={17} className="text-blue-500"/> Âm thanh dịu nhẹ
      </h3>
      <div className="space-y-2">
        {toggles.map(({key,label,icon})=>(
          <label key={key} className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-700">
            <span className="flex items-center gap-2">{icon}{label}</span>
            <input type="checkbox" checked={pref[key]} onChange={e=>updateSoundPreferences({ [key]: e.target.checked })}
              className="h-4 w-4 shrink-0 accent-blue-500" aria-label={label}/>
          </label>
        ))}
      </div>
      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        {SLIDERS.map(({key,label})=>(
          <label key={key} className="flex items-center gap-3 text-xs text-slate-600">
            <span className="w-20 shrink-0">{label}</span>
            <input type="range" min="0" max={key==='praiseVolume'?'0.45':'0.15'} step="0.01"
              value={pref[key]} onChange={e=>updateSoundPreferences({ [key]: Number(e.target.value) })}
              className="min-w-0 flex-1 accent-blue-500" aria-label={`Âm lượng ${label}`}/>
            <span className="w-8 text-right tabular-nums">{Math.round(pref[key]*100)}%</span>
          </label>
        ))}
      </div>
      {!CENTRAL_VOICE_READY && (
        <p role="status" className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
          <strong>Giọng nữ miền Trung:</strong> đang chờ bộ MP3 có bản quyền sử dụng. Đã tắt giọng máy đọc lời khen cũ; lời khen vẫn hiện bằng chữ.
        </p>
      )}
      {pref.explanation && (
        <p className="mt-2 text-[11px] text-slate-500">Giọng đọc giải thích tùy thuộc tiếng Việt đã cài trên thiết bị và có thể không phải giọng miền Trung.</p>
      )}
    </section>
  );
};
