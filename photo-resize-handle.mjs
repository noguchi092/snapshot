import {annotationMatrix,multiplyMatrix} from './annotation-transform.mjs?v=20261111-object-rotation';
export const resizeHandles={nw:[0,0],n:[.5,0],ne:[1,0],e:[1,.5],se:[1,1],s:[.5,1],sw:[0,1],w:[0,.5]};
export function annotationLocalPoint(annotation,p){
 const m=annotationMatrix(annotation),det=m[0]*m[3]-m[1]*m[2];if(Math.abs(det)<1e-10)return null;
 const x=p.x-m[4],y=p.y-m[5];return {x:(m[3]*x-m[2]*y)/det,y:(m[0]*y-m[1]*x)/det};
}
export function resizeAnnotationObject(annotation,original,bounds,handle,start,current,uniform=false,defaultFontSize=32){
 const position=resizeHandles[handle];if(!position)return false;
 const p=annotationLocalPoint(original,current),first=annotationLocalPoint(original,start);if(!p||!first)return false;
 const [hx,hy]=position,w=Math.max(bounds.width,1),h=Math.max(bounds.height,1),ax=bounds.x+(1-hx)*w,ay=bounds.y+(1-hy)*h;
 const vx=(hx*2-1)*w,vy=(hy*2-1)*h,dx=p.x-first.x,dy=p.y-first.y;
 const clamp=value=>Math.max(.05,Math.min(20,value));
 let sx=hx===.5?1:clamp(1+dx/vx),sy=hy===.5?1:clamp(1+dy/vy);
 const text=original.type==='text'||original.type==='symbol';
 if((uniform||text)&&hx!==.5&&hy!==.5){const ratio=clamp(1+(dx*vx+dy*vy)/(vx*vx+vy*vy));sx=sy=ratio;}
 if(text){const size=original.fontSize||defaultFontSize;sx=sy=Math.max(8,Math.min(600,size*sx))/size;}
 if(Math.abs(sx-1)+Math.abs(sy-1)<1e-7)return false;
 if(text){annotation.fontSize=(original.fontSize||defaultFontSize)*sx;annotation.x=ax+(original.x-ax)*sx;annotation.y=ay+(original.y-ay)*sy;}
 else {const m=multiplyMatrix(annotationMatrix(original),[sx,0,0,sy,ax*(1-sx),ay*(1-sy)]);if(m.some(n=>!Number.isFinite(n)||Math.abs(n)>1e7))return false;annotation.transformMatrix=m;}
 return true;
}
export function drawPhotoResizeHandles({svg,photo,annotation,bounds}){
 const m=annotationMatrix(annotation),scale=svg.getBoundingClientRect().width/photo.w;if(!scale)return;
 const lx=Math.hypot(m[0],m[1])||1,ly=Math.hypot(m[2],m[3])||1,padx=5/scale/lx,pady=5/scale/ly;
 const ns='http://www.w3.org/2000/svg',node=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
 const overlay=node('g',{class:'photo-object-handles photo-resize-handles'}),text=['text','symbol'].includes(annotation.type);
 for(const [key,[hx,hy]] of Object.entries(resizeHandles)){
  if(text&&(hx===.5||hy===.5))continue;
  if(hx===.5&&bounds.width*lx*scale<60||hy===.5&&bounds.height*ly*scale<60)continue;
  const x=bounds.x+hx*bounds.width+(hx*2-1)*padx,y=bounds.y+hy*bounds.height+(hy*2-1)*pady,cx=m[0]*x+m[2]*y+m[4],cy=m[1]*x+m[3]*y+m[5];
  const control=node('g',{'data-resize-handle':key,'data-id':annotation.id,class:'photo-resize-handle',role:'img','aria-label':'大きさを変更（'+key+'）'});
  const angle=(Math.atan2(m[1],m[0])*180/Math.PI+({n:0,ne:45,e:90,se:135,s:0,sw:45,w:90,nw:135}[key])+360)%180;
  control.style.cursor=['ns-resize','nesw-resize','ew-resize','nwse-resize'][Math.round(angle/45)%4];
  const title=node('title',{});title.textContent=text?'ドラッグで文字を拡大・縮小':'ドラッグで大きさを変更（Shiftで縦横比を固定）';
  control.append(title,node('circle',{cx,cy,r:14/scale,fill:'transparent'}),node('rect',{x:cx-5/scale,y:cy-5/scale,width:10/scale,height:10/scale,rx:1/scale,fill:'white',stroke:'#087ce8','stroke-width':1.5/scale,'pointer-events':'none'}));overlay.append(control);
 }
 svg.append(overlay);
}
