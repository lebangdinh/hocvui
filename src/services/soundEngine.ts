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
let activeSpeech: SpeechSynthesisUtterance | null = null;

function nativeSpeech(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

/** Only advertise voices that actually report a Vietnamese locale. */
export function getVietnameseVoices(): SpeechSynthesisVoice[] {
  const synth = nativeSpeech();
  if (!synth) return [];
  try {
    return synth.getVoices()
      .filter(v => /^vi(?:[-_]|$)/i.test(v.lang))
      .sort((a, b) => rankVoice(b) - rankVoice(a));
  } catch {
    return [];
  }
}

function rankVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  // HoaiMy is a documented female Vietnamese voice, but is only used when
  // this browser/OS actually exposes it. Never claim other voices are female.
  return (/hoai.?my|hoài.?my/.test(name) ? 100 : 0)
    + (/natural|neural|online/.test(name) ? 18 : 0)
    + (/female|\bnữ\b/.test(name) ? 12 : 0)
    + (/google/.test(name) ? 8 : 0)
    + (voice.default ? 2 : 0);
}

export function getPreferredVietnameseVoice(): SpeechSynthesisVoice | null {
  const voices = getVietnameseVoices();
  const preferred = getSoundPreferences().voiceId;
  return (preferred === 'auto' || preferred === 'central-pack'
    ? null : voices.find(v => v.voiceURI === preferred)) || voices[0] || null;
}

export function stopSpokenAudio(): void {
  if (activePraise) {
    activePraise.pause();
    activePraise.currentTime = 0;
    activePraise = null;
  }
  nativeSpeech()?.cancel();
  activeSpeech = null;
}

function speakVietnamese(text: string, type: 'praise' | 'explanation', force = false): boolean {
  const pref = getSoundPreferences();
  if (!force && !(type === 'praise' ? pref.praise : pref.explanation)) return false;
  const voice = getPreferredVietnameseVoice();
  const synth = nativeSpeech();
  if (!voice || !synth) return false;
  stopSpokenAudio();
  const phrase = text.trim().slice(0, type === 'praise' ? 100 : 1200);
  if (!phrase) return false;
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = type === 'praise' ? .91 : .89;
  utterance.pitch = 1.02;
  utterance.volume = type === 'praise' ? Math.min(.45, pref.praiseVolume) : .32;
  activeSpeech = utterance;
  utterance.onend = () => { if (activeSpeech === utterance) activeSpeech = null; };
  utterance.onerror = () => { if (activeSpeech === utterance) activeSpeech = null; };
  try {
    synth.speak(utterance);
    return true;
  } catch {
    activeSpeech = null;
    return false;
  }
}

/** Preview the selected Vietnamese voice from a direct user click. */
export function previewVietnameseVoice(): boolean {
  return speakVietnamese('Chào con! Hôm nay mình cùng học vui nhé!', 'praise', true);
}

/**
 * Use a licensed prerecorded central-Vietnamese clip if installed.
 * Otherwise select a *real* Vietnamese voice supplied by the device.
 * No API keys, voice impersonation or unknown-language synthesizers.
 */
export function playPraise(index: number): boolean {
  const pref = getSoundPreferences();
  if (!pref.praise || pref.praiseVolume <= 0) return false;
  const indexSafe = (index % PRAISES.length + PRAISES.length) % PRAISES.length;
  const usePack = CENTRAL_VOICE_READY && (pref.voiceId === 'auto' || pref.voiceId === 'central-pack');
  if (!usePack) return speakVietnamese(PRAISES[indexSafe], 'praise');
  stopSpokenAudio();
  const number = String(indexSafe + 1).padStart(2, '0');
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/vi-central/praise-${number}.mp3`);
  audio.volume = Math.min(.45, pref.praiseVolume);
  activePraise = audio;
  audio.onended = () => { if (activePraise === audio) activePraise = null; };
  audio.onerror = () => {
    if (activePraise === audio) activePraise = null;
    // A missing/corrupt MP3 must never leave the child without feedback.
    void speakVietnamese(PRAISES[indexSafe], 'praise');
  };
  void audio.play().catch(() => {
    if (activePraise === audio) activePraise = null;
    void speakVietnamese(PRAISES[indexSafe], 'praise');
  });
  return true;
}

/** Explicit opt-in: read dynamic answer explanations in Vietnamese. */
export function speakExplanation(text: string): boolean {
  return speakVietnamese(text, 'explanation');
}
