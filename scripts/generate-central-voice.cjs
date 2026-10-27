/* 
 * One-time voice-pack builder. Run only in a trusted environment with an FPT.AI
 * Text-to-Speech account whose terms allow the intended website distribution.
 * Usage: FPT_TTS_API_KEY=... node scripts/generate-central-voice.cjs
 * Do not place the key in Vite's VITE_* variables or client-side code.
 */
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const key = process.env.FPT_TTS_API_KEY;
if (!key) { console.error('Missing FPT_TTS_API_KEY (secret environment variable)'); process.exit(1); }
const phrases = [
  'Giỏi lắm, con!',
  'Chính xác rồi!',
  'Con làm tốt lắm!',
  'Rất tuyệt vời!',
  'Cố gắng rất tốt!',
  'Hay quá, con ơi!',
  'Hoan hô! Đúng rồi!',
  'Con tiến bộ rồi!'
];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const out = path.resolve(__dirname, '../public/audio/vi-central');
const service = 'https://api.fpt.ai/hmi/tts/v5';
async function generate(phrase, index) {
  const response = await fetch(service, {
    method: 'POST',
    headers: { api_key: key, voice: 'myan', speed: '-1', format: 'mp3', 'Content-Type': 'text/plain; charset=utf-8' },
    body: phrase
  });
  if (!response.ok) throw Error('FPT TTS request HTTP ' + response.status);
  const data = await response.json();
  if (data.error !== 0 || !data.async || !/^https:\/\//.test(data.async)) throw Error('FPT TTS did not accept clip ' + (index+1) + ': ' + JSON.stringify(data).slice(0,250));
  for (let tries = 0; tries < 30; tries++) {
    if (tries > 0) await delay(4000);
    try {
      const audio = await fetch(data.async, { redirect: 'follow' });
      if (!audio.ok) continue;
      const bytes = Buffer.from(await audio.arrayBuffer());
      const mp3 = bytes.length > 1500 &&
        ((bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0));
      if (!mp3) continue;
      const filename = `praise-${String(index+1).padStart(2,'0')}.mp3`;
      await fs.writeFile(path.join(out, filename), bytes);
      console.log('Generated ' + filename + ' (' + bytes.length + ' bytes)');
      return;
    } catch (err) { if (tries === 29) throw err; }
  }
  throw Error('FPT TTS output did not become available for clip ' + (index+1));
}
async function main() {
  await fs.mkdir(out, { recursive: true });
  for (let i=0; i<phrases.length; i++) await generate(phrases[i],i);
  const voiceFlag = path.resolve(__dirname, '../src/services/voicePack.ts');
  await fs.writeFile(voiceFlag,
`// Generated after checking that all eight FPT.AI Mỹ An clips exist.
export const CENTRAL_VOICE_READY = true;
`);
  await fs.writeFile(path.join(out,'README.txt'), 'FPT.AI Text to Speech. Voice myan. Generated for eight fixed Học Vui feedback phrases. Check provider license/plan terms before distribution.\n');
  console.log('Central Vietnamese voice package installed. The source will enable it on the next build.');
}
main().catch(error=>{ console.error(error.message);process.exit(1); });
