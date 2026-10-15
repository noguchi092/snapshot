export const isFillShape=a=>a?.type==='rect'||a?.type==='circle';
export function fillOpacity(a){return Number.isFinite(a?.fillOpacity)?Math.max(0,Math.min(1,a.fillOpacity)):.35;}
export function shapeFillAttributes(a){return `fill="${a.fill===true?a.color:'none'}" fill-opacity="${fillOpacity(a)}" pointer-events="all"`;}
export function setupShapeFill({root,prefix,getSelected,render,record}){
 const group=root.querySelector('#'+prefix+'fill-options'),toggle=root.querySelector('#'+prefix+'fill'),range=root.querySelector('#'+prefix+'fill-opacity'),output=root.querySelector('#'+prefix+'fill-opacity-value');
 function label(){output.textContent=range.value+'%';range.disabled=!toggle.checked;}
 function values(){return {fill:toggle.checked,fillOpacity:Number(range.value)/100};}
 function apply(save){const a=getSelected();if(isFillShape(a)){Object.assign(a,values());if(save)record();render();}label();}
 toggle.onchange=()=>apply(true);range.oninput=()=>apply(false);range.onchange=()=>apply(true);label();
 return {values,sync(tool){const a=getSelected(),shape=isFillShape(a);group.hidden=!shape&&!['rect','circle'].includes(tool);if(shape){toggle.checked=a.fill===true;range.value=String(Math.round(fillOpacity(a)*100));}label();}};
}
