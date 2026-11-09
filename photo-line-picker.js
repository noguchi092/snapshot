const styles=[['plain','実線'],['arrow','矢印'],['double-arrow','両矢印'],['dots','両端丸'],['dashed','点線'],['dashed-arrow','点線矢印'],['polyline','折れ線']];
function icon(type){
  const dashed=type.startsWith('dashed')?' stroke-dasharray="5 4"':'';
  const line=type==='polyline'?'<path d="M7 25L22 9L37 25L53 9"/>':`<path d="M8 17H52"${dashed}/>`;
  const end=['arrow','double-arrow','dashed-arrow'].includes(type)?'<path d="M43 9L52 17L43 25"/>':'';
  const start=type==='double-arrow'?'<path d="M17 9L8 17L17 25"/>':'';
  const dots=type==='dots'?'<circle cx="8" cy="17" r="3" fill="currentColor"/><circle cx="52" cy="17" r="3" fill="currentColor"/>':'';
  return `<svg viewBox="0 0 60 34" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${line}${end}${start}${dots}</svg>`;
}
export function setupPhotoLinePicker({root,select,onPick}){
  const group=document.createElement('div');group.className='photo-line-picker';group.setAttribute('role','group');group.setAttribute('aria-label','線の種類');
  for(const [value,label] of styles){const button=document.createElement('button');button.type='button';button.dataset.lineKind=value;button.title=label;button.setAttribute('aria-label',label);button.innerHTML=icon(value);button.onclick=()=>{if(value!=='polyline')select.value=value;onPick(value==='polyline'?'polyline':'line');};group.append(button);}
  root.querySelector('#photo-line-label').hidden=true;root.querySelector('#photo-line-label').after(group);
  return {sync(tool){group.hidden=!['line','polyline'].includes(tool);for(const b of group.children)b.setAttribute('aria-pressed',String(b.dataset.lineKind===(tool==='polyline'?'polyline':select.value)));}};
}
