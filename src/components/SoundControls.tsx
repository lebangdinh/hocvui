import React, { useEffect, useState } from 'react';
import { useSoundPreferences, updateSoundPreferences } from '../services/soundPreferences';
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
    const delayed = window.setTimeout(refresh, 1600);
    return () => {
      window.clearTimeout(delayed);
      synth.removeEventListener('voiceschanged', refresh);
    };
  }, []);

  const selectedVoice = voices.some(v => v.voiceURI === pref.voiceId);
  const selectVoice = (voiceId: string) => {
    stopSpokenAudio();
    // Selecting any new voice never starts talking automatically.
    updateSoundPreferences({ voiceId, praise: false, explanation: false });
    setMessage('');
  };
  const preview = () => {
    if (!selectedVoice) return;
    const ok = previewVietnameseVoice();
    setMessage(ok ? 'Đang nghe thử giọng đã chọn.' : 'Giọng này không phát được trên thiết bị.');
  };

  return (
    <section className={`w-full rounded-2xl border border-sky-100 bg-white p-3 text-left shadow-sm ${compact ? 'max-w-[370px]' : 'max-w-[440px]'}`} aria-label="Cài đặt âm thanh Học Vui">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <Volume2 size={17} className="text-blue-500"/> Âm thanh dịu nhẹ
      </h3>
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-2"><Music2 size={16}/> Nhạc nền</span>
          <input type="checkbox" checked={pref.music} onChange={e=>updateSoundPreferences({music:e.target.checked})}
            className="h-4 w-4 accent-blue-500" aria-label="Nhạc nền"/>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-2"><Sparkles size={16}/> Hiệu ứng nhẹ</span>
          <input type="checkbox" checked={pref.effects} onChange={e=>updateSoundPreferences({effects:e.target.checked})}
            className="h-4 w-4 accent-blue-500" aria-label="Hiệu ứng nhẹ"/>
        </label>
        <label className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${selectedVoice ? 'bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-400'}`}>
          <span className="flex items-center gap-2"><Mic size={16}/> Giọng khen (tự chọn)</span>
          <input type="checkbox" checked={selectedVoice && pref.praise} disabled={!selectedVoice}
            onChange={e=>{ updateSoundPreferences({praise:e.target.checked}); if (!e.target.checked) stopSpokenAudio(); }}
            className="h-4 w-4 accent-blue-500 disabled:cursor-not-allowed" aria-label="Bật lời khen bằng giọng nói"/>
        </label>
        <label className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${selectedVoice ? 'bg-slate-50 text-slate-700' : 'bg-slate-100 text-slate-400'}`}>
          <span className="flex items-center gap-2"><Speech size={16}/> Đọc giải thích (tự chọn)</span>
          <input type="checkbox" checked={selectedVoice && pref.explanation} disabled={!selectedVoice}
            onChange={e=>{updateSoundPreferences({explanation:e.target.checked}); if (!e.target.checked) stopSpokenAudio();}}
            className="h-4 w-4 accent-blue-500 disabled:cursor-not-allowed" aria-label="Bật đọc giải thích"/>
        </label>
      </div>
      <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
        <p className="text-xs font-bold text-amber-900">Đã tắt giọng tổng hợp cũ</p>
        <p className="mt-1 text-[11px] leading-relaxed text-amber-900">
          Lời khen của bé vẫn hiện bằng chữ kèm tín hiệu nhỏ. Hệ thống không tự bật bất kỳ giọng máy nào.
        </p>
        <label htmlFor="hocvui-voice" className="mb-2 mt-3 block text-xs font-extrabold text-slate-700">Lựa chọn giọng đọc (không bắt buộc)</label>
        <select id="hocvui-voice" value={selectedVoice ? pref.voiceId : 'silent'} onChange={e=>selectVoice(e.target.value)}
          className="w-full rounded-xl border border-indigo-100 bg-white px-2 py-2 text-xs font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
          <option value="silent">Không đọc – chỉ khen bằng chữ (mặc định)</option>
          {voices.map((voice,i)=><option key={voice.voiceURI+'-'+i} value={voice.voiceURI}>{voice.name} · {voice.localService ? 'trên máy' : 'qua mạng'}</option>)}
        </select>
        <button type="button" onClick={preview} disabled={!selectedVoice}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
          <PlayCircle size={16}/> Nghe thử trước khi bật
        </button>
        {message && <p role="status" className="mt-2 text-[11px] text-indigo-800">{message}</p>}
        {voices.length===0 && <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
          Máy này không có giọng tiếng Việt phù hợp. Không cần cài thêm: bé vẫn chơi và học bình thường.
        </p>}
      </div>
      <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
        {SLIDERS.filter(({key}) => selectedVoice || key !== 'praiseVolume').map(({key,label,limit})=>(
          <label key={key} className="flex items-center gap-3 text-xs text-slate-600">
            <span className="w-20 shrink-0">{label}</span>
            <input type="range" min="0" max={limit} step=".01" value={Math.min(limit,pref[key])}
              onChange={e=>updateSoundPreferences({[key]:Number(e.target.value)})}
              className="min-w-0 flex-1 accent-blue-500" aria-label={`Âm lượng ${label}`}/>
            <span className="w-8 text-right tabular-nums">{Math.round(pref[key]*100)}%</span>
          </label>
        ))}
      </div>
    </section>
  );
};
