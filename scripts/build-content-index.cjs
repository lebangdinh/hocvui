const fs=require('node:fs');
const {rel,digest}=require('./review-helpers.cjs');
const hash=digest();
const filename=rel('content/bank-fingerprint.json');
const next=JSON.stringify({hash, version:'V5',purpose:'Invalidates approvals whenever question or curriculum source changes'},null,2)+'\n';
if (!fs.existsSync(filename) || fs.readFileSync(filename,'utf8')!==next) fs.writeFileSync(filename,next);
console.log('Content fingerprint:',hash.slice(0,16));
