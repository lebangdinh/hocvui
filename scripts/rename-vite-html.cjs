'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'dist');
const src = path.join(root, 'vite-entry.html');
if (!fs.existsSync(src)) throw Error('Missing Vite output: ' + src);
fs.renameSync(src, path.join(root, 'index.html'));
console.log('PASS: dist/index.html generated for GitHub Pages');
