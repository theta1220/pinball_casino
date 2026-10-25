from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
import json, pathlib
root=pathlib.Path(r'C:\Users\nkcta\pinball_casino')
chars=''.join(chr(i) for i in range(32,127))
styles={}
for name,fontfile,color in [('gold','georgiab.ttf','#ffe4a0'),('body','segoeuib.ttf','#fff8e7'),('numeric','georgiab.ttf','#ffda75')]:
    font=ImageFont.truetype('C:/Windows/Fonts/'+fontfile,56)
    sheet=Image.new('RGBA',(1536,576),(0,0,0,0)); draw=ImageDraw.Draw(sheet); glyphs={}
    for i,ch in enumerate(chars):
        x=(i%16)*96;y=(i//16)*96
        mask=Image.new('L',(96,96),0);ImageDraw.Draw(mask).text((12,68),ch,font=font,fill=255,anchor='ls',stroke_width=2 if name=='numeric' else 1)
        cell=Image.new('RGBA',(96,96),(0,0,0,0));bbox=mask.getbbox()
        if bbox:
            thick=2 if name=='gold' else 1
            outline=mask.filter(ImageFilter.MaxFilter(thick*2+1))
            shadow=ImageChops.offset(outline,2,3).filter(ImageFilter.GaussianBlur(1.1)).point(lambda v:int(v*.7))
            cell.paste((8,5,2,230),(0,0),shadow)
            for depth in range(3 if name!='body' else 1,0,-1):cell.paste((85,43,9,255) if name!='body' else (15,24,20,255),(0,0),ImageChops.offset(outline,0,depth))
            cell.paste((42,23,8,255) if name!='body' else (13,29,23,255),(0,0),outline)
            gradient=Image.new('RGBA',(96,96)); gd=ImageDraw.Draw(gradient)
            stops=[(0,(255,253,218)),(.22,(255,229,145)),(.40,(220,154,46)),(.47,(255,248,201)),(.55,(255,218,99)),(.78,(181,105,21)),(1,(255,228,139))] if name!='body' else [(0,(255,255,246)),(.4,(255,247,225)),(1,(225,218,190))]
            for yy in range(96):
                t=max(0,min(1,(yy-bbox[1])/max(1,bbox[3]-bbox[1])))
                for j in range(len(stops)-1):
                    a,ca=stops[j];b,cb=stops[j+1]
                    if a<=t<=b:
                        f=(t-a)/(b-a);rgb=tuple(round(ca[k]*(1-f)+cb[k]*f) for k in range(3));break
                gd.line((0,yy,95,yy),fill=(*rgb,255))
            cell.paste(gradient,(0,0),mask)
        sheet.alpha_composite(cell,(x,y))
        glyphs[ch]={'x':x,'y':y,'w':96,'h':96,'advance':round((max(font.getlength(d) for d in '0123456789') if name=='numeric' and ch.isdigit() else font.getlength(ch))+(4 if name=='numeric' else 3 if ch!=' ' else 0),4),'originX':12,'baseline':68,'inkBounds':cell.getchannel('A').getbbox()}
    kerning={}
    for a in chars:
        for b in chars:
            k=round(font.getlength(a+b)-font.getlength(a)-font.getlength(b),4)
            if abs(k)>.01:kerning[a+b]=k
    file='text-'+name+'-v1.png';sheet.save(root/'assets'/file)
    styles[name]={'file':file,'fontSource':'Windows installed '+fontfile+'; raster output only; font file not redistributed','fontSize':56,'lineHeight':76,'baseline':56,'decorationPadding':3,'effects':'Georgia Bold numeric with2px filled-glyph emboldening and tabular advances; other bold fonts1px; baked outline, shadow, extrusion and glossy gradient; subdued body','glyphs':glyphs,'kerning':kerning}
data={'version':1,'characters':chars,'fallback':'?','styles':styles}
(root/'text-atlas-manifest.js').write_text('globalThis.PINBALL_TEXT='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
print('Generated3 styles x95 ASCII glyphs, advances/baselines/kerning, transparent padding')
