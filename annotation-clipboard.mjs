export function duplicateAnnotation(original,id,dx,dy){
 const copy=structuredClone(original);copy.id=id;
 if(copy.transformMatrix){copy.transformMatrix[4]+=dx;copy.transformMatrix[5]+=dy;}
 else {copy.x+=dx;copy.y+=dy;if(copy.x2!==undefined)copy.x2+=dx;if(copy.y2!==undefined)copy.y2+=dy;if(copy.points)copy.points=copy.points.map(([x,y])=>[x+dx,y+dy]);}
 return copy;
}
export function annotationPasteOffset(bounds,width,height,step){
 const margin=Math.min(4,width/10,height/10);
 const offset=(low,size,limit)=>{if(size>limit-2*margin)return margin-low;const desired=low+size+step>limit-margin&&low-step>=margin?-step:step;return Math.max(margin-low,Math.min(limit-margin-low-size,desired));};
 return {x:offset(bounds.x,bounds.width,width),y:offset(bounds.y,bounds.height,height)};
}
