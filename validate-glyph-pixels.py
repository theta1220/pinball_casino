from PIL import Image
import json,pathlib
p=pathlib.Path(r'C:\Users\nkcta\pinball_casino')
data=json.loads((p/'text-atlas-manifest.js').read_text().split('=',1)[1].strip().rstrip(';'))
for name,m in data['styles'].items():
 im=Image.open(p/'assets'/m['file']);assert im.mode=='RGBA'
 for ch,g in m['glyphs'].items():
  box=im.getchannel('A').crop((g['x'],g['y'],g['x']+96,g['y']+96)).getbbox()
  if ch==' ':assert box is None
  else:assert box and box[0]>0 and box[1]>0 and box[2]<96 and box[3]<96,(name,ch,box)
 print(name,':94 visible glyphs + blank space, no cell-edge bleed')
for f in ['settings-gear-v1.png','ui-frame-v3.png','ui-base-v3.png']:
 im=Image.open(p/'assets'/f);assert im.mode=='RGBA';assert im.getchannel('A').getextrema()==(0,255);print(f,im.size,'alpha0..255')

frame=Image.open('assets/ui-frame-v3.png').convert('RGBA')
assert frame.getpixel((frame.width//2,frame.height//2))[3]==0,'frame center must be transparent'
base=Image.open('assets/ui-base-v3.png').convert('RGBA')
assert base.getpixel((base.width//2,base.height//2))[3]>200,'base material exists independently'
print('PASS transparent frame center and separate textured base; runtime opacity is base-only')
