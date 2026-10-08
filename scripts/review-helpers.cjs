const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const rel = path => require('node:path').join(root, path);
const assetFiles = [
  'src/services/questionBank.ts',
  'src/constants/curriculum.ts',
  'content/extra-practice-bank.json',
  'content/sgk-math-alignment.json'
];
function digest() {
  const hash = crypto.createHash('sha256');
  for (const filename of assetFiles) { hash.update(filename); hash.update('\0'); hash.update(fs.readFileSync(rel(filename))); hash.update('\0'); }
  return hash.digest('hex');
}
function getQueue() {return JSON.parse(fs.readFileSync(rel('content/alignment-review-queue.json'),'utf8'));}
function saveQueue(data) {fs.writeFileSync(rel('content/alignment-review-queue.json'),JSON.stringify(data,null,2)+'\n');}
module.exports = {root,rel,digest,getQueue,saveQueue};
