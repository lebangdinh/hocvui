import assert from 'node:assert/strict';
import { frameGate, canvasPointerX } from '../src/services/gameTiming';
import { withDeadline } from '../src/services/asyncDeadline';
for (const refresh of [60, 120, 144]) {
  const step = frameGate(); let frames = 0;
  for (let n = 0; n < refresh * 5; n++) if (step(n * 1000 / refresh)) frames++;
  assert.ok(Math.abs(frames - 300) <= 1, `${refresh}Hz produced ${frames} simulation steps`);
}
assert.equal(canvasPointerX(160, 10, 300, 480), 240);
assert.equal(canvasPointerX(10, 10, 0, 480), 240);
assert.equal(await withDeadline(Promise.resolve('ok'), 50), 'ok');
let completed = false;
const slow = new Promise(resolve => setTimeout(() => { completed = true; resolve(true); }, 30));
await assert.rejects(withDeadline(slow, 1), (e: any) => e.code === 'deadline-exceeded');
await slow;
assert.equal(completed, true, 'timeout must not claim to cancel underlying write');
console.log('PASS: 60/120/144Hz frame budget, mobile coordinate scaling, deadline and late completion semantics');
