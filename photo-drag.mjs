const protectedControls='img,button,input,textarea,select,a,[contenteditable]';
export function isPhotoDragSurface(target){return !target.closest(protectedControls);}
export function trackPhotoDragOrigin(handle){
 let allowed=false;
 handle.addEventListener('pointerdown',event=>{allowed=isPhotoDragSurface(event.target);});
 return event=>{
  if(allowed&&isPhotoDragSurface(event.target))return true;
  // Let text fields keep their native text selection/drag behavior.
  if(!event.target.closest('input,textarea,[contenteditable]'))event.preventDefault();
  return false;
 };
}
