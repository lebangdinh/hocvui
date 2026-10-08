'use strict';
/** Compile standalone curriculum/questionBank with TypeScript; verify generated answers independently. */
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'hoc-vui-v5-bank-'));
const go=(cmd,args)=>{
 const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',shell:process.platform==='win32'});
 if(r.status!==0)process.exitCode=r.status||1;
 return r.status===0;
};
try {
 const success=go('tsc',['--outDir',tmp,'--module','commonjs','--target','ES2022','--moduleResolution','node','--esModuleInterop','--resolveJsonModule','--skipLibCheck','src/types.ts','src/constants/curriculum.ts','src/services/questionBank.ts']);
 if(success)go('node',['scripts/validate-bank.cjs',tmp]);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
