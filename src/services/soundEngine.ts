import { getSoundPreferences } from './soundPreferences';

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

// Generate mellow feedback locally instead of downloading loud external MP3s.
// Effects are deliberately short; all sound remains optional.
const EFFECT_NOTES = {
  correct: [523, 659],
  incorrect: [392, 349],
  finish: [523, 659, 784],
  move: [420],
  shoot: [510],
  explosion: [300, 350],
  gameOver: [392, 329],
  flip: [480]
} as const;

export type EffectKind = keyof typeof EFFECT_NOTES;
let sharedContext: AudioContext | null = null;
const lastPlayed: Partial<Record<EffectKind, number>> = {};

export function playEffect(kind: EffectKind): HTMLAudioElement | null {
  const pref = getSoundPreferences();
  if (!pref.effects || pref.effectsVolume <= 0 || typeof window === 'undefined') return null;
  const ctor = window.AudioContext || (window as Window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
  if (!ctor) return null;
  const now = performance.now();
  const gap = kind === 'shoot' ? 115 : kind === 'move' ? 90 : 80;
  if (lastPlayed[kind] && now - lastPlayed[kind]! < gap) return null;
  lastPlayed[kind] = now;
  try {
    if (!sharedContext || sharedContext.state === 'closed') sharedContext = new ctor();
    const ctx = sharedContext;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    const notes = EFFECT_NOTES[kind];
    const peak = Math.min(.032, Math.max(.002, pref.effectsVolume * .25));
    const duration = kind === 'shoot' || kind === 'move' ? .075 : .13;
    notes.forEach((frequency, index) => {
      const start = ctx.currentTime + index * (kind === 'finish' ? .095 : .065);
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      envelope.gain.setValueAtTime(.0001, start);
      envelope.gain.exponentialRampToValueAtTime(peak, start + .012);
      envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(envelope);
      envelope.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .005);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
  } catch {
    // Sound must never interrupt a child's learning or gameplay.
  }
  return null;
}

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
  const preferred = getSoundPreferences().voiceId;
  // The child must never hear synthetic praise unless a parent has explicitly
  // selected and enabled a specific Vietnamese voice in Settings.
  if (preferred === 'silent') return null;
  return getVietnameseVoices().find(v => v.voiceURI === preferred) || null;
}

export function stopSpokenAudio(): void {
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

/** Only play speech when a parent explicitly selects a Vietnamese device voice. */
export function previewVietnameseVoice(): boolean {
  return speakVietnamese('Chào con! Hôm nay mình cùng học vui nhé!', 'praise', true);
}

export function playPraise(index: number): boolean {
  const pref = getSoundPreferences();
  if (!pref.praise || pref.voiceId === 'silent' || pref.praiseVolume <= 0) return false;
  const validIndex = (index % PRAISES.length + PRAISES.length) % PRAISES.length;
  return speakVietnamese(PRAISES[validIndex], 'praise');
}

/** Read long explanations only when a matching Vietnamese device voice is selected. */
export function speakExplanation(text: string): boolean {
  return speakVietnamese(text, 'explanation');
}
