const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const old=/^(?:v[6789][-_]|.*-v[6789][-_]|.*v[6789]-.*)$/i;
const whitelist=new Set(['package-lock.json']);
const targets=['content','scripts','docs','.github/workflows'];
let legacy=[];
for (const dir of targets){
 if(!fs.existsSync(path.join(root,dir)))continue;
 const scan=p=>{for(const ent of fs.readdirSync(p,{withFileTypes:true})){
   if(ent.name.startsWith('.'))continue;
   const full=path.join(p,ent.name);
   if(ent.isDirectory())scan(full);
   else if(old.test(ent.name)&&!whitelist.has(ent.name))legacy.push(path.relative(root,full));
 }};scan(path.join(root,dir));
}
for(const name of ['HUONG_DAN_V7_AI_SO_TUYEN.md','V7_RELEASE_NOTES.md','HUONG_DAN_V9_CHONG_TRUNG_LUYEN_TAP_CHUNG.md','.github/workflows/deploy-hocvui-v5.yml','content/extra-practice-bank.json','content/ai-screening-manifest.json'])
 if(fs.existsSync(path.join(root,name)))legacy.push(name);
if(legacy.length){console.error('LỖI: Các dữ liệu/tài liệu cũ vẫn còn trên repo. Cần xóa:',legacy);process.exit(1)}
const metadata=require(path.join(root,'metadata.json'));
if(!metadata.name.includes('V11'))throw Error('Metadata ứng dụng chưa cập nhật về V11');
const bank=require(path.join(root,'content/practice-bank-v11.json'));
const items=bank.topics.flatMap(x=>x.items);
if(items.length!==2823||bank.version!=='11.1-curated')throw Error('Bank V11 invalid');
if(items.some(q=>/(?:^|[-_:])v(?:6|7|8|9)(?:[-_:]|$)/i.test(q.id)))throw Error('IDs của câu hỏi chưa chuẩn hóa');
if(/(?:^|[-_:])v(?:6|7|8|9)(?:[-_:]|$)/i.test(JSON.stringify(bank)))throw Error('Ngân hàng còn metadata phiên bản cũ');
console.log(`PASS V11 CLEAN: ${items.length} câu được phát hành; không có gói dữ liệu/metadata V6–V9.`);
