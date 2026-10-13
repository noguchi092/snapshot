export function appendPhotoPageControls(header,count,onApply){
  const controls=document.createElement('div');controls.className='photo-page-controls';
  controls.innerHTML='<label>写真枚数<select aria-label="このページの写真枚数"></select></label><select class="photo-page-scope" aria-label="写真枚数の適用範囲"><option value="page">このページだけ</option><option value="following">このページ以降</option></select><button type="button">適用</button>';
  const counts=controls.querySelector('label select');
  for(let i=1;i<=20;i++)counts.add(new Option(i+'枚',String(i)));
  counts.value=String(count);
  controls.querySelector('button').onclick=()=>onApply(Number(counts.value),controls.querySelector('.photo-page-scope').value);
  header.append(controls);
}
