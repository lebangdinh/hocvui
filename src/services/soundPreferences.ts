import { useSyncExternalStore } from 'react';

export type SoundPreferences = {
  music: boolean;
  musicVolume: number;
  effects: boolean;
  effectsVolume: number;
  praise: boolean;
  praiseVolume: number;
  explanation: boolean;
};

const STORAGE_KEY = 'hocvui.sound.v2';
const defaults: SoundPreferences = {
  music: false,
  musicVolume: 0.08,
  effects: true,
  effectsVolume: 0.08,
  praise: true,
  praiseVolume: 0.3,
  explanation: false
};

function initialPrefs(): SoundPreferences {
  if (typeof window === 'undefined') return defaults;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const combined = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof SoundPreferences)[]) {
      const value = stored[key];
      if (typeof value !== typeof defaults[key]) continue;
      if (typeof value === 'number' && (!Number.isFinite(value) || value < 0 || value > 1)) continue;
      (combined as any)[key] = value;
    }
    return combined;
  } catch {
    return defaults;
  }
}

let current: SoundPreferences = initialPrefs();
const subscribers = new Set<() => void>();
export const getSoundPreferences = (): SoundPreferences => current;
export const subscribeSound = (listener: () => void) => {
  subscribers.add(listener);
  return () => { subscribers.delete(listener); };
};
export const useSoundPreferences = () => useSyncExternalStore(subscribeSound, getSoundPreferences, () => defaults);
export const updateSoundPreferences = (changes: Partial<SoundPreferences>) => {
  current = { ...current, ...changes };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch { /* private browsing */ }
  for (const listener of subscribers) listener();
};

// Keep settings in sync between multiple tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) {
      current = initialPrefs();
      for (const listener of subscribers) listener();
    }
  });
}
