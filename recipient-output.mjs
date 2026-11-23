const keyOf=name=>name.trim()?'name:'+name.trim():'unassigned';
const entries=photo=>photo.recipientEntries?.length?photo.recipientEntries.filter(r=>!r.done):[{name:photo.recipient||'',done:false}];
export function outputRecipients(photos){
 const choices=new Map();for(const photo of photos)if(!photo.blank)for(const r of entries(photo)){const key=keyOf(r.name);choices.set(key,{key,label:r.name.trim()||'指示先未設定'});}
 return [...choices.values()].sort((a,b)=>a.label.localeCompare(b.label,'ja'));
}
export function recipientOutputSource(state,keys=null){
 if(keys===null)return state;
 const selected=new Set(keys),photos=[];
 for(const photo of state.photos){if(photo.blank)continue;const chosen=entries(photo).filter(r=>selected.has(keyOf(r.name)));if(chosen.length)photos.push({...photo,outputRecipientNames:(photo.recipientEntries?.length?photo.recipientEntries.map(r=>r.name).filter(Boolean).join('、'):photo.recipient||''),recipientEntries:photo.recipientEntries?.map(r=>({...r}))});}
 const ids=new Set(photos.map(p=>p.id)),numbers=new Map(photos.map(p=>[p.id,p.nativeNumber]));
 const drawings=state.drawings.filter(d=>d.annotations.some(a=>['number','photo-callout'].includes(a.type)&&ids.has(a.photoId))).map(d=>({...d,annotations:d.annotations.filter(a=>a.type==='number'?ids.has(a.photoId):!a.photoId||ids.has(a.photoId)).map(a=>a.type==='number'?{...a,number:numbers.get(a.photoId)||a.number}:{...a})}));
 return {...state,photos,drawings};
}
export function setupRecipientOutput({container,getState,downloadAll}){
 let selection=null,previousMembers=new Map();
 // Names are editable. Follow the same photo/recipient identities across edits
 // and hydration, while continuing to group output by the current name.
 function reconcile(){
  const state=getState(),members=new Map();
  for(const photo of state.photos)if(!photo.blank)for(const r of entries(photo))members.set(photo.id+':'+(r.id||photo.id),keyOf(r.name));
  if(selection!==null){
   const next=new Set(selection),available=new Set(members.values());
   for(const [id,key] of members)if(selection.has(previousMembers.get(id)))next.add(key);
   for(const key of next)if(!available.has(key))next.delete(key);
   selection=next;
  }
  previousMembers=members;
 }

 const button=document.createElement('button');button.type='button';button.id='recipient-output';button.title='印刷・PDFの出力先を選択';button.setAttribute('aria-haspopup','dialog');container.querySelector('#summary').after(button);
 const dialog=document.createElement('dialog');dialog.className='pro-dialog recipient-output-dialog';dialog.setAttribute('aria-labelledby','recipient-output-title');
 dialog.innerHTML='<form><h2 id="recipient-output-title">出力する指示先</h2><p>印刷・PDF保存・Excel保存に適用します。複数選択できます。</p><label class="recipient-output-all"><input type="checkbox" data-all> すべての指示先</label><div class="recipient-output-choices"></div><p class="recipient-output-count" role="status"></p><p>選択した指示に関係する図面だけを出力し、対象外の写真番号は非表示にします。写真番号は元の番号を保持します。業者別PDFはZIPにまとめて保存できます。</p><div class="recipient-output-actions"><button type="button" data-download-all>業者ごとにPDF一括保存（ZIP）</button><button type="button" data-cancel>キャンセル</button><button type="submit" class="primary">この条件を適用</button></div></form>';
 document.body.append(dialog);const form=dialog.querySelector('form'),list=dialog.querySelector('.recipient-output-choices'),all=dialog.querySelector('[data-all]'),count=dialog.querySelector('[role=status]'),submit=dialog.querySelector('[type=submit]');
 function update(){reconcile();const choices=outputRecipients(getState().photos),names=selection===null?['すべて']:choices.filter(c=>selection.has(c.key)).map(c=>c.label);button.textContent='出力先：'+(names.join('・')||'対象なし')+' ▾';button.title='印刷・PDFの出力先：'+names.join('、');button.disabled=!getState().photos.length&&!getState().drawings.length;}
 button.onclick=()=>{reconcile();const state=getState(),choices=outputRecipients(state.photos);list.replaceChildren();const boxes=[];
  function paint(){const keys=boxes.filter(b=>b.checked).map(b=>b.value),isAll=keys.length===choices.length;all.checked=isAll;all.indeterminate=keys.length>0&&!isAll;const source=recipientOutputSource(state,isAll?null:keys);count.textContent='写真 '+source.photos.filter(p=>!p.blank).length+'枚 ／ 図面 '+source.drawings.length+'ページ';submit.disabled=!keys.length&&choices.length>0;dialog.querySelector('[data-download-all]').disabled=!choices.length;}
  for(const choice of choices){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';box.value=choice.key;box.checked=selection===null||selection.has(choice.key);box.onchange=paint;label.append(box,document.createTextNode(' '+choice.label));list.append(label);boxes.push(box);}
  all.onchange=()=>{boxes.forEach(b=>b.checked=all.checked);paint();};form.onsubmit=e=>{e.preventDefault();if(submit.disabled)return;selection=all.checked?null:new Set(boxes.filter(b=>b.checked).map(b=>b.value));update();dialog.close();};paint();dialog.showModal();
 };
 dialog.querySelector('[data-download-all]').onclick=()=>{dialog.close();downloadAll();};dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();update();
 return {update,suffix(){reconcile();return selection===null?'':'_'+outputRecipients(getState().photos).filter(c=>selection.has(c.key)).map(c=>c.label).join('・').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').slice(0,80);},source(){reconcile();const source=recipientOutputSource(getState(),selection);if(selection!==null&&!source.photos.length)throw Error('出力対象の写真がありません。「出力先」から指示先を選び直してください。');return source;}};
}
