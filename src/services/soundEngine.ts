import { getSoundPreferences } from './soundPreferences';
import { CENTRAL_VOICE_READY } from './voicePack';

export const PRAISES = [
  'Giỏi lắm, con!',
  'Chính xác rồi!',
  'Con làm tốt lắm!',
  'Rất tuyệt vời!',
  'Cố gắng rất tốt!',
  'Hay quá, con ơi!',
  'Hoan hô! Đúng rồi!',
  'Con tiến bộ rồi!'
] as const;

// Short, soft UI sounds. Never stack a loud chime over spoken praise.
const soundUrls = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  finish: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  move: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  shoot: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  explosion: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  gameOver: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  flip: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3'
} as const;

export type EffectKind = keyof typeof soundUrls;

export function playEffect(kind: EffectKind): HTMLAudioElement | null {
  const pref = getSoundPreferences();
  if (!pref.effects || pref.effectsVolume === 0) return null;
  const audio = new Audio(soundUrls[kind]);
  audio.volume = Math.max(.001, Math.min(.14, pref.effectsVolume));
  void audio.play().catch(() => undefined);
  return audio;
}

let activePraise: HTMLAudioElement | null = null;
let activeExplanation: SpeechSynthesisUtterance | null = null;

export function stopSpokenAudio(): void {
  if (activePraise) {
    activePraise.pause();
    activePraise.currentTime = 0;
    activePraise = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeExplanation = null;
}

/**
 * The selected central Vietnamese accent requires REAL prerecorded clips.
 * We intentionally DO NOT fall back to low-quality browser TTS for praise.
 */
export function playPraise(index: number): boolean {
  const pref = getSoundPreferences();
  if (!pref.praise || !CENTRAL_VOICE_READY || pref.praiseVolume <= 0) return false;
  stopSpokenAudio();
  const number = String((index % PRAISES.length + PRAISES.length) % PRAISES.length + 1).padStart(2, '0');
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/vi-central/praise-${number}.mp3`);
  audio.volume = Math.min(.45, pref.praiseVolume);
  activePraise = audio;
  audio.onended = () => { if (activePraise === audio) activePraise = null; };
  audio.onerror = () => { if (activePraise === audio) activePraise = null; };
  void audio.play().catch(() => { if (activePraise === audio) activePraise = null; });
  return true;
}

/** Explicit opt-in: device speech for variable-length explanations only. */
export function speakExplanation(text: string): boolean {
  const pref = getSoundPreferences();
  if (!pref.explanation || typeof window === 'undefined' || !window.speechSynthesis) return false;
  stopSpokenAudio();
  const voices = window.speechSynthesis.getVoices();
  const localVi = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith('vi'));
  if (!localVi) return false; // Never synthesize Vietnamese with an English voice.
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 2000));
  utterance.voice = localVi;
  utterance.lang = 'vi-VN';
  utterance.rate = .88;
  utterance.pitch = 1;
  utterance.volume = .38;
  activeExplanation = utterance;
  utterance.onend = () => { if (activeExplanation === utterance) activeExplanation = null; };
  window.speechSynthesis.speak(utterance);
  return true;
}
