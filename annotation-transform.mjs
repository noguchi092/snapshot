export const annotationMatrix=a=>Array.isArray(a?.transformMatrix)&&a.transformMatrix.length===6&&a.transformMatrix.every(n=>Number.isFinite(n)&&Math.abs(n)<=1e7)?a.transformMatrix:[1,0,0,1,0,0];
export function multiplyMatrix(a,b){return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];}
export const normalizedAngle=value=>((value+180)%360+360)%360-180;
export function rotateAnnotationObject(a,bounds,angle){
 const old=Number.isFinite(a.rotationAngle)?a.rotationAngle:0,next=normalizedAngle(angle),r=(next-old)*Math.PI/180,c=Math.cos(r),s=Math.sin(r),m=annotationMatrix(a),x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2,cx=m[0]*x+m[2]*y+m[4],cy=m[1]*x+m[3]*y+m[5];
 a.transformMatrix=multiplyMatrix([c,s,-s,c,cx-c*cx+s*cy,cy-s*cx-c*cy],m);a.rotationAngle=next;
}
export function transformedAnnotation(a,markup){return a.transformMatrix?`<g transform="matrix(${annotationMatrix(a).join(' ')})">${markup}</g>`:markup;}
