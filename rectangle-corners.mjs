import {shapeFillAttributes} from './shape-fill.mjs?v=20261016-fill';
// Keep the rect type so existing saved rectangles remain editable.
export function rectangleCorners(a){
 if(Array.isArray(a.points)&&a.points.length===4&&a.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)))return a.points.map(p=>[...p]);
 const x=Math.min(a.x,a.x2??a.x),y=Math.min(a.y,a.y2??a.y),right=Math.max(a.x,a.x2??a.x),bottom=Math.max(a.y,a.y2??a.y);
 return [[x,y],[right,y],[right,bottom],[x,bottom]];
}
export function moveRectangleCorner(a,index,p){
 if(a?.type!=='rect'||!Number.isInteger(index)||index<0||index>3||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const points=rectangleCorners(a);points[index]=[p.x,p.y];a.points=points;[a.x,a.y]=points[0];[a.x2,a.y2]=points[2];return true;
}
export function rectangleSvg(a,attr,sw,selected,radius){
 const points=rectangleCorners(a),outline=`<polygon points="${points.map(p=>p.join(',')).join(' ')}" ${shapeFillAttributes(a)} stroke="${a.color}" stroke-width="${sw}" stroke-linejoin="round"/>`;
 const handles=selected?points.map(([x,y],i)=>`<g data-rect-corner="${i}" style="cursor:move"><circle cx="${x}" cy="${y}" r="${radius*2.2}" fill="none" pointer-events="all"/><circle cx="${x}" cy="${y}" r="${radius}" fill="white" stroke="#087ce8" stroke-width="2" vector-effect="non-scaling-stroke" pointer-events="none"/></g>`).join(''):'';
 return `<g ${attr}>${outline}${handles}</g>`;
}
