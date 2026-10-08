const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const name of ['alignment-review-queue.json', 'bank-fingerprint.json']) {
  fs.copyFileSync(path.join(root, 'content', name), path.join(root, 'functions', 'content', name));
}
const bank = require(path.join(root, 'content/extra-practice-bank.json'));
const topics = bank.topics.map(x => x.topicId);
// Question bank also includes algorithmically generated math items and inline language items.
fs.writeFileSync(path.join(root, 'functions/content/extra-bank-topic-ids.json'), JSON.stringify(topics, null, 2) + '\n');
console.log(`Prepared secure function content. Extra-bank subjects: ${topics.length}`);
