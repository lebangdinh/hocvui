import React, { useEffect, useState } from 'react';
import { useSoundPreferences, updateSoundPreferences } from '../services/soundPreferences';
import { CENTRAL_VOICE_READY, SOUTHERN_VOICE_READY } from '../services/voicePack';
import { getVietnameseVoices, previewVietnameseVoice, stopSpokenAudio } from '../services/soundEngine';
import { Volume2, Music2, Sparkles, Mic, Speech, PlayCircle } from 'lucide-react';

type SliderSetting = 'musicVolume' | 'effectsVolume' | 'praiseVolume';
const SLIDERS: { key: SliderSetting; label: string; limit: number }[] = [
  { key: 'musicVolume', label: 'Nhạc nền', limit: .15 },
  { key: 'effectsVolume', label: 'Hiệu ứng', limit: .15 },
  { key: 'praiseVolume', label: 'Giọng khen', limit: .45 }
];

export const SoundControls: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const pref = useSoundPreferences();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    const refresh = () => setVoices(getVietnameseVoices());
    refresh();
    synth.addEventListener('voiceschanged', refresh);
    // Chrome can load its voice list after the component mounts.
    const delayed = window.setTimeout(refresh, 1600);
    return () => {
      window.clearTimeout(delayed);
      synth.removeEventListener('voiceschanged', refresh);
    };
  }, []);

  const setVoice = (voiceId: string) => {
    stopSpokenAudio();
    updateSoundPreferences({voiceId});
    setMessage('');
  };
  const preview = () => {
    const ok = previewVietnameseVoice();
    setMessage(ok ? 'Đang phát giọng tiếng Việt đã chọn.' : 'Chưa phát được tiếng Việt. Vui lòng kiểm tra âm lượng và thử tải lại trang.');
  };

  const toggles = [
    { key: 'music' as const, label: 'Nhạc nền', icon: <Music2 size={16}/> },
    { key: 'effects' as const, label: 'Hiệu ứng nhẹ', icon: <Sparkles size={16}/> },
    { key: 'praise' as const, label: 'Lời khen giọng tiếng Việt', icon: <Mic size={16}/> },
    { key: 'explanation' as const, label: 'Đọc giải thích (tự chọn)', icon: <Speech size={16}/> }
  ];
  return (
    <section className={`w-full rounded-2xl border border-sky-100 bg-white p-3 text-left shadow-sm ${compact ? 'max-w-[370px]' : 'max-w-[440px]'}`} aria-label="Cài đặt âm thanh Học Vui">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <Volume2 size={17} className="text-blue-500"/> Âm thanh dịu nhẹ
      </h3>
      <div className="space-y-2">
        {toggles.map(({key,label,icon})=>(
          <label key={key} className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-700">
            <span className="flex items-center gap-2">{icon}{label}</span>
            <input type="checkbox" checked={pref[key]}
              onChange={e=>{updateSoundPreferences({[key]:e.target.checked}); if (!e.target.checked && (key === 'praise' || key === 'explanation')) stopSpokenAudio(); }}
              className="h-4 w-4 shrink-0 accent-blue-500" aria-label={label}/>
          </label>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
        <label htmlFor="hocvui-voice" className="mb-2 block text-xs font-extrabold text-slate-700">Giọng cô khen – tiếng Việt</label>
        <select id="hocvui-voice" value={pref.voiceId === 'piper-vi' ? 'south-vi' : pref.voiceId} onChange={e=>setVoice(e.target.value)}
          className="w-full rounded-xl border border-indigo-100 bg-white px-2 py-2 text-xs font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
          <option value="auto">{SOUTHERN_VOICE_READY ? 'Cô Yến Nhi – nữ miền Nam (mặc định)' : 'Tự chọn giọng Việt phù hợp nhất'}</option>
          {SOUTHERN_VOICE_READY && <option value="south-vi">Cô Yến Nhi – nữ miền Nam (MP3)</option>}
          {CENTRAL_VOICE_READY && <option value="central-pack">Cô Mỹ An – miền Trung (MP3)</option>}
          {voices.map((voice,i)=><option key={voice.voiceURI+'-'+i} value={voice.voiceURI}>{voice.name}{voice.localService ? ' · trên máy' : ' · qua mạng'}</option>)}
        </select>
        <button type="button" onClick={preview} disabled={!CENTRAL_VOICE_READY && !SOUTHERN_VOICE_READY && voices.length===0}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
          <PlayCircle size={16}/> Nghe thử giọng
        </button>
        {message && <p role="status" className="mt-2 text-[11px] text-indigo-800">{message}</p>}
        {voices.length===0 && !CENTRAL_VOICE_READY && !SOUTHERN_VOICE_READY && (
          <p role="status" className="mt-2 rounded-lg bg-amber-50 px-2 py-2 text-[11px] text-amber-900">
            Chưa tìm thấy giọng tiếng Việt trên thiết bị này. Lời khen sẽ hiện chữ và phát tín hiệu nhỏ, không dùng giọng tiếng Anh đọc tiếng Việt.
          </p>
        )}
        {SOUTHERN_VOICE_READY && (
          <div className="mt-2 space-y-1">
            <p className="text-[11px] leading-relaxed text-emerald-700">
              Website đã có 8 câu khen tạo sẵn bằng giọng Yến Nhi, nữ miền Nam. Không cần cài giọng trên máy. Bấm “Nghe thử giọng” để nghe ngay.
            </p>
            <a href={`${import.meta.env.BASE_URL}audio/vi-south/ATTRIBUTION.txt`} target="_blank" rel="noopener noreferrer"
              className="inline-block text-[11px] text-indigo-600 underline underline-offset-2">
              Ghi công giọng Yến Nhi · MIT
            </a>
          </div>
        )}
        {voices.length>0 && (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Ưu tiên giọng nữ Hoài My nếu máy có. Tên giọng và chất lượng tùy trình duyệt, nên anh có thể nghe thử và đổi cô khác.
          </p>
        )}
      </div>

      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        {SLIDERS.map(({key,label,limit})=>(
          <label key={key} className="flex items-center gap-3 text-xs text-slate-600">
            <span className="w-20 shrink-0">{label}</span>
            <input type="range" min="0" max={limit} step=".01"
              value={Math.min(limit,pref[key])}
              onChange={e=>updateSoundPreferences({[key]:Number(e.target.value)})}
              className="min-w-0 flex-1 accent-blue-500" aria-label={`Âm lượng ${label}`}/>
            <span className="w-8 text-right tabular-nums">{Math.round(pref[key]*100)}%</span>
          </label>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        {SOUTHERN_VOICE_READY ? 'Giọng Yến Nhi – nữ miền Nam – đã có sẵn trên website, không cần API key.' : 'Đang dùng giọng tiếng Việt có sẵn trên máy. Giọng miền Trung thu sẵn chỉ hiện khi có bộ MP3 được cấp phép.'}
        Phần giải thích chỉ đọc khi bật và nhấn nút loa ở đáp án.
      </p>
    </section>
  );
};
