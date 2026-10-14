// Shared paper geometry for trial and Pro: full-height photo, notes at right.
export const PHOTO_WIDTH=.76;
export const PHOTO_GAP=12;
export function photoPageSpace(width,height,landscape){
 const margin=landscape?40:36,footer=92,header=94;
 return {margin,W:width-margin*2,top:margin+header,bottom:height-footer};
}
export function fittedPhotoBox(image,x,y,w,h){
 const scale=Math.min(w/image.width,h/image.height);
 return {x:x+(w-image.width*scale)/2,y:y+(h-image.height*scale)/2,width:image.width*scale,height:image.height*scale};
}
