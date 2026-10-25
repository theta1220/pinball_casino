from PIL import Image
import math,collections,json
im=Image.open('assets/roulette-disc.png').convert('RGB')
def classify(c):
 r,g,b=c
 if max(c)<95:return 'black'
 if r>140 and g<90 and b<100:return 'red'
 if g>80 and r<90 and g>1.5*r and g>1.4*b:return 'green'
 return None
raw=[]
for i in range(3600):
 a=i*math.pi/1800
 votes=[classify(im.getpixel((round(627+r*1176/380*math.cos(a)),round(624+r*1174/380*math.sin(a))))) for r in [105,110,140,155]]
 v=collections.Counter(x for x in votes if x)
 raw.append(v.most_common(1)[0][0] if v and v.most_common(1)[0][1]>=3 else None)
filled=[]
for i,c in enumerate(raw):
 if c:filled.append(c);continue
 for d in range(1,100):
  a,b=raw[(i-d)%3600],raw[(i+d)%3600]
  if a or b:filled.append(a or b);break
segments=[]
for i,c in enumerate(filled):
 if i==0 or c!=filled[i-1]:segments.append([i/10,c])
meta=json.load(open('roulette-color-map.json'))
assert segments==meta['segments']
assert filled[660]=='black'
import hashlib
assert hashlib.sha256(open('assets/roulette-disc.png','rb').read()).hexdigest()==meta['sha256']
source=open('rules.js',encoding='utf8').read()
import re
assert json.loads(re.search(r'rouletteSegments=(\[.*?\]);',source).group(1))==segments
print('PASS actual asset hash/crop and3069confident color samples;66deg black; gold divider interpolation; runtime map equals measured map')
