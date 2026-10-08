'use strict';
const fs = require('node:fs');
const read = p => fs.readFileSync(p, 'utf8');
const games = read('src/components/GameModule.tsx');
const learning = read('src/components/LearningModule.tsx');
const engine = read('src/services/soundEngine.ts');
const prefs = read('src/services/soundPreferences.ts');
const voice = read('src/services/voicePack.ts');
const statements = [
  ['Easy star game replaces difficult puzzle', games.includes('const StarCatchGame =') && !games.includes('const PuzzleGame =')],
  ['12 stars and no timer', games.includes('const GOAL = 12;') && games.includes('Không giới hạn thời gian')],
  ['Independent music, effects, praise and explanation', ['music:','effects:','praise:','explanation:'].every(k=>prefs.includes(k))],
  ['Short gentle praise and no automatic browser TTS', learning.includes('playPraise(praiseIndex)') && !learning.includes('window.speechSynthesis.speak(')],
  ['Explanation requires explicit opt-in and Vietnamese voice', engine.includes("type === 'praise' ? pref.praise : pref.explanation") && engine.includes("getPreferredVietnameseVoice()")],
  ['No fallback to English voice for Vietnamese', engine.includes("filter(v => /^vi") && engine.includes("if (!voice || !synth) return false;")],
  ['Female Vietnamese voice prioritized when available', engine.includes("hoai.?my") && engine.includes("rankVoice(b) - rankVoice(a)")],
  ['Voice picker and preview are wired', read('src/components/SoundControls.tsx').includes("previewVietnameseVoice()") && read('src/components/SoundControls.tsx').includes("getVietnameseVoices()")],
  ['Chosen voice is saved across sessions', prefs.includes("voiceId: 'auto'") && prefs.includes("localStorage.setItem(STORAGE_KEY")],
  ['Voice flag matches presence of all eight local MP3s', (() => {
    const installed = voice.includes('CENTRAL_VOICE_READY = true');
    const clips = Array.from({length:8},(_,i)=>`public/audio/vi-central/praise-${String(i+1).padStart(2,'0')}.mp3`);
    return !installed || clips.every(f=>fs.existsSync(f) && fs.statSync(f).size>1500);
  })()]
];
for (const [name,passed] of statements) {
  console.log((passed ? 'PASS' : 'FAIL') + ': ' + name);
  if (!passed) process.exitCode = 1;
}
