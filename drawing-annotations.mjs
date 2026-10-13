export const arrowHeadScales={small:.38,medium:.65,large:1};
export function arrowHeadLength(size,base,photoEditor=false){return base*(photoEditor?1:arrowHeadScales[size]||arrowHeadScales.small);}
export function numberPinGeometry(a,r){
 const tip={x:a.x2??a.x,y:a.y2??a.y+r*2},dx=tip.x-a.x,dy=tip.y-a.y,d=Math.hypot(dx,dy);
 if(a.x2===undefined||a.y2===undefined||d<=r*1.05)return {tip,path:''};
 const ux=dx/d,uy=dy/d,along=r*r/d,across=r*Math.sqrt(1-r*r/(d*d));
 const left={x:a.x+ux*along-uy*across,y:a.y+uy*along+ux*across},right={x:a.x+ux*along+uy*across,y:a.y+uy*along-ux*across};
 return {tip,path:`M${left.x} ${left.y}L${tip.x} ${tip.y}L${right.x} ${right.y}Z`};
}
export function numberPinSvg(a,sz,sw,selected=false){
 const {tip,path}=numberPinGeometry(a,sz*.8);
 return {tail:path?`<path d="${path}" fill="${a.color}" stroke="${a.color}" stroke-width="${sw}" stroke-linejoin="round"/>`:'',handle:selected?`<circle data-number-tip="true" cx="${tip.x}" cy="${tip.y}" r="${Math.max(sz*.24,sw*1.5)}" fill="white" stroke="#087ce8" stroke-width="${Math.max(sw,sz*.08)}" stroke-dasharray="none" class="number-tip-handle"/>`:''};
}
export function moveNumberTip(annotation,point){annotation.x2=point.x;annotation.y2=point.y;}
