'use strict';
const fs = require('node:fs');
const read = p => fs.readFileSync(p, 'utf8');
const games = read('src/components/GameModule.tsx');
const learning = read('src/components/LearningModule.tsx');
const engine = read('src/services/soundEngine.ts');
const prefs = read('src/services/soundPreferences.ts');
const controls = read('src/components/SoundControls.tsx');
const workflow = read('.github/workflows/deploy-hocvui-v5.yml');
const statements = [
  ['Easy star game replaces difficult puzzle', games.includes('const StarCatchGame =') && !games.includes('const PuzzleGame =')],
  ['12 stars and no timer', games.includes('const GOAL = 12;') && games.includes('Không giới hạn thời gian')],
  ['Independent music, effects, praise and explanation', ['music:','effects:','praise:','explanation:'].every(k=>prefs.includes(k))],
  ['Safe default does not speak', prefs.includes("voiceId: 'silent'") && prefs.includes('praise: false') && prefs.includes("hocvui.sound.v3")],
  ['Older saved settings cannot reactivate a disliked voice', prefs.includes('LEGACY_KEY') && prefs.includes("key === 'voiceId' || key === 'praise' || key === 'explanation'")],
  ['Praise remains written in the learning app', learning.includes('setPraise(PRAISES[praiseIndex])') && learning.includes("playSound('correct')")],
  ['Device Vietnamese voices require opt-in', engine.includes("if (preferred === 'silent') return null;") && engine.includes("pref.voiceId === 'silent'")],
  ['No automatic embedded synthetic voice playback', !engine.includes('SOUTHERN_VOICE_READY') && !engine.includes("new Audio(")],
  ['No English fallback for Vietnamese', engine.includes('filter(v => /^vi') && engine.includes('if (!voice || !synth) return false;')],
  ['Gentle sound cues synthesized locally', engine.includes("oscillator.type = 'sine'") && !engine.includes('assets.mixkit.co')],
  ['Voice preview only by conscious user action', controls.includes('if (!selectedVoice) return;') && controls.includes('Nghe thử trước khi bật')],
  ['No scary voice choices advertised', !controls.includes('Yến Nhi') && controls.includes('Không đọc – chỉ khen bằng chữ')],
  ['Website build no longer creates rejected voice', !workflow.includes('generate-piper-voice') && !workflow.includes("VITE_SOUTHERN_VOICE_READY")],
];
for (const [name,passed] of statements) {
  console.log((passed ? 'PASS' : 'FAIL') + ': ' + name);
  if (!passed) process.exitCode = 1;
}
