import {annotationMatrix} from './annotation-transform.mjs?v=20261111-object-rotation';
export function drawPhotoRotationHandle({svg,photo,annotation,rotateBy}){
 const element=[...svg.querySelectorAll('.annotation[data-id]')].find(el=>el.dataset.id===annotation.id);if(!element)return null;
 const bounds=element.getBBox(),m=annotationMatrix(annotation),scale=svg.getBoundingClientRect().width/photo.w,pad=5/scale;
 const transform=(x,y)=>({x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]});
 const center=transform(bounds.x+bounds.width/2,bounds.y+bounds.height/2),top=transform(bounds.x+bounds.width/2,bounds.y-pad),length=Math.hypot(m[2],m[3])||1,radius=22/scale;
 const handle={x:Math.max(radius,Math.min(photo.w-radius,top.x-m[2]/length*38/scale)),y:Math.max(radius,Math.min(photo.h-radius,top.y-m[3]/length*38/scale))};
 const corners=[[bounds.x-pad,bounds.y-pad],[bounds.x+bounds.width+pad,bounds.y-pad],[bounds.x+bounds.width+pad,bounds.y+bounds.height+pad],[bounds.x-pad,bounds.y+bounds.height+pad]].map(([x,y])=>transform(x,y));
 const ns='http://www.w3.org/2000/svg',node=(name,attributes)=>{const el=document.createElementNS(ns,name);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,value);return el;};
 const overlay=node('g',{'class':'photo-object-handles'});
 const frame=node('polygon',{points:corners.map(p=>p.x+','+p.y).join(' '),fill:'transparent',stroke:'#087ce8','stroke-width':1.5/scale,'stroke-dasharray':4/scale+' '+3/scale,'data-id':annotation.id,'class':'photo-object-selection photo-object-handles'});svg.insertBefore(frame,svg.firstChild);
 overlay.append(node('line',{x1:top.x,y1:top.y,x2:handle.x,y2:handle.y,stroke:'#087ce8','stroke-width':1.5/scale,'pointer-events':'none'}));
 const control=node('g',{'data-rotate-handle':'true','data-id':annotation.id,'class':'photo-rotation-handle',role:'button',tabindex:'0','aria-label':'書き込みの回転ハンドル','aria-description':'ドラッグで回転。左右キーでも回転できます。'});
 const title=node('title',{});title.textContent='ドラッグで回転（Shiftで15度刻み）';control.append(title,node('circle',{cx:handle.x,cy:handle.y,r:radius,fill:'transparent',stroke:'none'}),node('circle',{cx:handle.x,cy:handle.y,r:14/scale,fill:'white',stroke:'#087ce8','stroke-width':2/scale}));
 const icon=node('path',{d:'M -5 3 A 6 6 0 1 1 5 -3 M 5 -7 L 5 -3 L 1 -3',fill:'none',stroke:'#087ce8','stroke-width':1.8,'stroke-linecap':'round','stroke-linejoin':'round','pointer-events':'none',transform:`translate(${handle.x} ${handle.y}) scale(${1/scale})`});control.append(icon);
 control.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.stopPropagation();rotateBy((e.key==='ArrowLeft'?-1:1)*(e.shiftKey?15:1));svg.querySelector('[data-rotate-handle]')?.focus();}};
 overlay.append(control);svg.append(overlay);return {bounds,center};
}
