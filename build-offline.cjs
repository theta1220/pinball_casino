/* Build-time only. Runtime is a standalone file:// HTML; source files stay editable. */
const fs=require('fs'),path=require('path'),vm=require('vm');const root=__dirname;
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),cache=new Map();
function data(f){if(!cache.has(f)){const types={'.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg'};const type=types[path.extname(f)];if(!type)throw Error('Unsupported embedded asset '+f);cache.set(f,'data:'+type+';base64,'+fs.readFileSync(path.join(root,f)).toString('base64'));}return cache.get(f);}
const ctx={};vm.createContext(ctx);vm.runInContext(read('asset-manifest.js'),ctx);const images={};for(const m of Object.values(ctx.PINBALL_ASSETS))images[m.file]=data('assets/'+m.file);
vm.runInContext(read('text-atlas-manifest.js'),ctx);for(const meta of Object.values(ctx.PINBALL_TEXT.styles))images[meta.file]=data('assets/'+meta.file);
const cssAssets=new Map();
let css=read('style.css').replace(/@import\s+url\([^)]*\);/g,'').replace(/url\(['"]?(assets\/[^)'"\s]+)['"]?\)/g,(_,f)=>{if(!cssAssets.has(f))cssAssets.set(f,'--embedded-image-'+cssAssets.size);return 'var('+cssAssets.get(f)+')';});
for(const f of cssAssets.keys())images[path.basename(f)]=data(f);
const cssPayload=Object.fromEntries([...cssAssets].map(([f,k])=>[k,data(f)]));
const cssBootstrap="(function hydrate(assets,css){const rules=Object.entries(assets).map(([key,value])=>{const [head,body]=value.split(',');const bytes=Uint8Array.from(atob(body),c=>c.charCodeAt(0));return key+':url(\"'+URL.createObjectURL(new Blob([bytes],{type:head.slice(5,head.indexOf(';'))}))+'\")';}).join(';');const style=document.createElement('style');style.textContent=':root{'+rules+'}'+css;document.head.append(style);})("+JSON.stringify(cssPayload)+","+JSON.stringify(css)+");";
let html=read('index.html').replace(/<link[^>]+href="style.css"[^>]*>/,'<script>'+cssBootstrap+'</script>');
html=html.replace(/<script(?: type="module")? src="([^"]+)"><\/script>/g,(_,f)=>{let s=read(f);if(f==='sprites.js')s=s.replace("img.src='assets/'+meta.file","img.src=OFFLINE_IMAGES[meta.file]");s=s.replaceAll("'assets/reel-strip.png'",JSON.stringify(data('assets/reel-strip.png'))).replaceAll("'bgm/song.mp3'",JSON.stringify(data('bgm/song.mp3')));if(f==='game.js')s='(()=>{'+s+'})();';return '<script>'+s.replace(/<\/script/gi,'<\\/script')+'</script>';});
html=html.replace('<body>','<body><script>const OFFLINE_IMAGES='+JSON.stringify(images)+'</script>');
if(/<script[^>]+src=|<link[^>]+href=|@import/.test(html))throw Error('Unbundled runtime dependency');
fs.writeFileSync(path.join(root,'PLAY_OFFLINE.html'),html);console.log(JSON.stringify({entry:'PLAY_OFFLINE.html',bytes:Buffer.byteLength(html),embeddedFiles:cache.size,networkRequired:false}));
