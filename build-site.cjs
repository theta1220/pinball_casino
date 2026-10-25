const fs=require('fs'),path=require('path'),vm=require('vm');
const root=__dirname,out=path.join(root,'_site'),files=new Set(['index.html','style.css','bgm/song.mp3','assets/reel-strip.png']);
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const m of read('index.html').matchAll(/<script(?: type="module")? src="([^"]+)"/g))files.add(m[1]);
const ctx={};vm.createContext(ctx);vm.runInContext(read('asset-manifest.js')+';'+read('text-atlas-manifest.js'),ctx);
for(const m of Object.values(ctx.PINBALL_ASSETS))files.add('assets/'+m.file);
for(const m of Object.values(ctx.PINBALL_TEXT.styles))files.add('assets/'+m.file);
for(const m of read('style.css').matchAll(/url\(['"]?(assets\/[^)'"\s]+)['"]?\)/g))files.add(m[1]);
fs.mkdirSync(out,{recursive:true});
// Refuse stale output instead of deploying an earlier broader directory.
if(fs.readdirSync(out).length)throw Error('_site must be empty before building');
for(const f of files){if(f.includes('..')||path.isAbsolute(f))throw Error('Unsafe path '+f);const bytes=fs.readFileSync(path.join(root,f));if(bytes.subarray(0,80).toString().startsWith('version https://git-lfs.github.com/spec/v1'))throw Error('Unresolved LFS pointer: '+f);const dest=path.join(out,f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,f==='style.css'?bytes.toString().replace(/@import\s+url\([^)]*\);/g,''):bytes);}
const cp=require('child_process');let commit='uncommitted';try{commit=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({commit,files:files.size}));fs.writeFileSync(path.join(out,'.nojekyll'),'');console.log(JSON.stringify({siteFiles:files.size,commit}));
