/* Explicit compositing mask traced from the original image.png and character-free board upper OUTER red rail silhouette.
   White reveals the character, black restores board foreground. Not a visible graphic. */
class PinballOcclusionMask {
 static edge(x){const points=[[0,385],[30,337],[50,296],[70,269],[100,240],[130,220],[160,205],[200,190],[240,181],[263,172],[274,143],[292,116],[315,97],[345,80],[380,66],[420,54],[440,48],[494,49],[540,50],[590,54],[640,61],[690,73],[730,87],[770,105],[810,128],[840,152],[868,180],[890,211],[910,247],[930,286],[941,310]];for(let i=1;i<points.length;i++)if(x<=points[i][0]){const [a,b]=points[i-1],[c,d]=points[i];return b+(d-b)*(x-a)/(c-a);}return 310;}
 static alpha(x,y){return Math.max(0,Math.min(1,(this.edge(x)+2-y)/4));}
 static raster(width=941,height=1672){const data=new Uint8Array(width*height*4);for(let x=0;x<width;x++){const edge=this.edge(x);for(let y=0;y<height;y++){const i=(y*width+x)*4,v=Math.round(Math.max(0,Math.min(1,(edge+2-y)/4))*255);data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}}return data;}
}
globalThis.PinballOcclusionMask=PinballOcclusionMask;if(typeof module!=='undefined')module.exports=PinballOcclusionMask;
