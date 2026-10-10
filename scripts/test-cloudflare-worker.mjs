import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker, { reserveQuota } from '../cloudflare/worker.js';
const sqlite = new DatabaseSync(':memory:');
sqlite.exec('CREATE TABLE ai_quota(user_key TEXT PRIMARY KEY, day TEXT NOT NULL, used INTEGER NOT NULL DEFAULT 0, last_at INTEGER NOT NULL DEFAULT 0)');
const DB = { prepare(sql) { return { bind(...args) { return { async first() { return sqlite.prepare(sql).get(...args) || null; } }; } }; } };
const now = Date.parse('2026-10-10T05:00:00Z');
const race = await Promise.allSettled(Array.from({length: 12}, () => reserveQuota(DB, 'race', now)));
assert.equal(race.filter(r => r.status === 'fulfilled').length, 1);
for (let i = 1; i < 40; i++) await reserveQuota(DB, 'race', now + i * 3000);
await assert.rejects(reserveQuota(DB, 'race', now + 120000), e => e.status === 429);
await reserveQuota(DB, 'race', now + 86400000);
assert.equal(sqlite.prepare('SELECT used FROM ai_quota').get().used, 1);
const pair = await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk = await crypto.subtle.exportKey('jwk',pair.publicKey); jwk.kid = 'test-key';
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
async function token(overrides = {}) {
  const time = Math.floor(Date.now()/1000);
  const text = `${b64({alg:'RS256',kid:jwk.kid})}.${b64({aud:'hoc-vui-tieu-hoc-2026',iss:'https://securetoken.google.com/hoc-vui-tieu-hoc-2026',sub:'owner',iat:time-10,auth_time:time-10,exp:time+3600,...overrides})}`;
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(text));
  return `${text}.${Buffer.from(signature).toString('base64url')}`;
}
let fields = {uid:{stringValue:'owner'}, id:{stringValue:'child'}, grade:{integerValue:'1'}};
let aiCalls = 0, dbCalls = 0, lastInput;
const env = {DB:{prepare(...args){ dbCalls++; return DB.prepare(...args); }}, AI:{async run(model,input){ aiCalls++; lastInput=input; assert.match(model,/llama-3.3/); return {response:'Con cùng đếm lại nhé.'}; }}};
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (url.includes('/jwk/')) return Response.json({keys:[jwk]});
  assert.match(url,/\/users\/owner\/profiles\/child$/);
  assert.match(options.headers.Authorization,/^Bearer /);
  return Response.json({fields});
};
const goodToken = await token();
const body = {profileId:'child',message:'Vì sao 2 + 3 = 5?',history:[]};
async function call(data=body, auth=goodToken, origin='https://lebangdinh.github.io') {
  return worker.fetch(new Request('https://test/chat',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:`Bearer ${auth}`},body:JSON.stringify(data)}),env);
}
try {
  const health = await worker.fetch(new Request('https://test/'),env);
  assert.equal(health.status,200); assert.equal(aiCalls,0); assert.equal(dbCalls,0);
  assert.equal((await call(body,goodToken,'https://evil.example')).status,403);
  assert.equal((await call(body,'bad.token.parts')).status,401);
  assert.equal((await call(body,await token({aud:'another-project'}))).status,401);
  assert.equal((await call(body,await token({exp:1}))).status,401);
  const forged = goodToken.split('.'); forged[1]=b64({aud:'hoc-vui-tieu-hoc-2026',iss:'https://securetoken.google.com/hoc-vui-tieu-hoc-2026',sub:'attacker',iat:1,auth_time:1,exp:9999999999});
  assert.equal((await call(body,forged.join('.'))).status,401);
  fields.uid.stringValue='other-owner'; assert.equal((await call()).status,403); fields.uid.stringValue='owner';
  fields.deletedAt={timestampValue:'2026-01-01'}; assert.equal((await call()).status,403); delete fields.deletedAt;
  assert.equal((await call({...body,questionContext:{}})).status,400);
  assert.equal((await call({...body,message:'x'.repeat(21000)})).status,413);
  assert.equal(aiCalls,0); assert.equal(dbCalls,0);
  const context = {subject:'math',topicId:'1-math-2',question:{text:'2 + 3 = ?',options:['4','5','6'],correctAnswer:'5',explanation:'Đếm thêm 3 từ 2 được 5.'},userAnswer:'4'};
  const reply=await call({...body,questionContext:context,history:[{role:'model',text:'irrelevant'}]});
  assert.equal(reply.status,200); assert.equal((await reply.json()).contextApplied,true);
  assert.equal(lastInput.messages.length,2); assert.match(lastInput.messages[1].content,/2 \+ 3/);
  assert.equal((await call()).status,429); assert.equal(aiCalls,1);
  env.DB={prepare(){throw Error('D1 unavailable');}};
  assert.equal((await call()).status,503); assert.equal(aiCalls,1);
  console.log('PASS: verified JWT/signature, ownership/trash, payload bounds, CORS, contextual prompt, D1 atomic quota/cooldown/reset, fail closed. AI and network mocked; no live inference tested.');
} finally { globalThis.fetch=realFetch; sqlite.close(); }
