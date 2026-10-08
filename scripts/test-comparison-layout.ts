import assert from 'node:assert/strict';
import { getComparisonVisual } from '../src/services/comparisonVisual';
import { readFileSync } from 'node:fs';

for (const count of [0,1,5,10,20]) {
  const result=getComparisonVisual(String(count));
  assert.ok(result && result.useDots);
  assert.equal(result.dots,count);
  assert.ok(result.dots<=20);
}
for (const count of [21,99,100,999,80413,99999,1000000]) {
  const result=getComparisonVisual(String(count));
  assert.ok(result && !result.useDots);
  assert.equal(result.dots,0);
  assert.equal(result.digitCount,String(count).length);
  assert.equal(result.digits.join(''),String(count));
}
assert.equal(getComparisonVisual('80413')?.display,'80.413');
assert.equal(getComparisonVisual('abc'),null);
assert.equal(getComparisonVisual('1234567890123'),null);

const learning=readFileSync('src/components/LearningModule.tsx','utf8');
assert.ok(!learning.includes('Array.from({ length: Number(number) }'), 'Must not create one dot for every number unit');
assert.ok(learning.includes('Array.from({ length: visual.dots }'), 'Tiny values can be represented by safe dot counts');
assert.ok(learning.includes('comparisonOptions') && learning.includes('grid-cols-3'), 'Three inequality answers should fit on one row');
console.log('PASS: 0-20 dots and 21+ compact digit comparisons including 80.413');
console.log('PASS: 3 sign options in one row, no unbounded dot creation');
