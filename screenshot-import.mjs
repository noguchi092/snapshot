export function screenshotTitle(now=new Date()){const pad=n=>String(n).padStart(2,'0');return 'スクリーンショット '+now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+pad(now.getHours())+pad(now.getMinutes());}
export function pastedImage(data){
 for(const item of Array.from(data?.items||[])){if(item.type?.startsWith('image/')){const file=item.getAsFile();if(file)return file;}}
 return Array.from(data?.files||[]).find(f=>f.type.startsWith('image/'))||null;
}
export async function screenshotCanvas(file,{makeCanvas=()=>document.createElement('canvas'),decode=async file=>{const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();return image;}finally{URL.revokeObjectURL(url);}}}={}){
 if(!file?.type?.startsWith('image/'))throw new Error('スクリーンショット画像を貼り付けてください。');
 if(file.size>30*1024*1024)throw new Error('画像は30MB以内で追加してください。');
 const image=await decode(file),width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 if(!width||!height)throw new Error('画像を読み取れませんでした。');
 const ratio=Math.min(1,6000/Math.max(width,height)),canvas=makeCanvas();canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
 const g=canvas.getContext('2d');g.fillStyle='white';g.fillRect(0,0,canvas.width,canvas.height);g.drawImage(image,0,0,canvas.width,canvas.height);return canvas;
}
export function setupScreenshotImport({button,canEdit,add}){
 const dialog=document.createElement('dialog');dialog.className='screenshot-dialog';
 dialog.innerHTML='<form><h2>スクリーンショットで追加</h2><p>Windowsは Win＋Shift＋S などで画面をコピーし、下の欄に貼り付けてください。</p><div class="screenshot-paste" contenteditable="true" role="textbox" aria-label="スクリーンショット貼り付け欄" tabindex="0" data-placeholder="ここをクリックして Ctrl＋V ／ 右クリック → 貼り付け"></div><button type="button" class="screenshot-read">クリップボードから貼り付け</button><label>画像ファイルから選ぶ（任意）<input class="screenshot-file" type="file" accept="image/*"></label><img class="screenshot-preview" alt="追加するスクリーンショットのプレビュー" hidden><label>図面タイトル<input class="screenshot-title" maxlength="120" required></label><p class="screenshot-status" role="status"></p><div class="screenshot-actions"><button type="button" class="screenshot-cancel">キャンセル</button><button type="submit" class="primary screenshot-add" disabled>図面として追加</button></div></form>';
 document.body.append(dialog);
 const $=s=>dialog.querySelector(s),area=$('.screenshot-paste'),title=$('.screenshot-title'),preview=$('.screenshot-preview'),status=$('.screenshot-status'),submit=$('.screenshot-add');
 let file=null,previewUrl=null,saving=false,generation=0;
 function enabled(){submit.disabled=saving||!file||!title.value.trim();dialog.querySelectorAll('button,input').forEach(el=>{if(el!==submit)el.disabled=saving;});}
 function clear(){generation++;file=null;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;preview.removeAttribute('src');preview.hidden=true;area.textContent='';}
 function accept(image){if(saving||!dialog.open)return;if(!image?.type?.startsWith('image/')){status.textContent='画像が見つかりません。スクリーンショットをコピーしてから貼り付けてください。';return;}if(image.size>30*1024*1024){status.textContent='画像は30MB以内で追加してください。';return;}file=image;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(file);preview.src=previewUrl;preview.hidden=false;status.textContent='画像を貼り付けました。タイトルを確認して追加してください。';area.textContent='';enabled();}
 area.addEventListener('paste',e=>{e.preventDefault();accept(pastedImage(e.clipboardData));});
 area.addEventListener('input',()=>{area.textContent='';});
 $('.screenshot-read').onclick=async()=>{const token=generation;try{if(!navigator.clipboard?.read)throw new Error();const items=await navigator.clipboard.read();if(token!==generation||!dialog.open)return;for(const item of items){const type=item.types.find(t=>t.startsWith('image/'));if(type){const image=await item.getType(type);if(token===generation&&dialog.open)accept(image);return;}}accept(null);}catch{if(token===generation&&dialog.open)status.textContent='クリップボードを直接読み取れませんでした。貼り付け欄をクリックして Ctrl＋V、または右クリックの「貼り付け」を使ってください。';}};
 $('.screenshot-file').onchange=e=>{accept(e.target.files[0]);e.target.value='';};
 title.oninput=enabled;$('.screenshot-cancel').onclick=()=>{if(!saving)dialog.close();};dialog.oncancel=e=>{if(saving)e.preventDefault();};dialog.addEventListener('close',clear);
 $('form').onsubmit=async e=>{e.preventDefault();if(saving||!file||!title.value.trim()||!canEdit())return;saving=true;status.textContent='図面を追加しています…';enabled();try{const added=await add(file,title.value.trim());if(added===true)dialog.close();}catch(error){status.textContent=error.message||'画像を追加できませんでした。';}finally{saving=false;enabled();}};
 button.onclick=()=>{if(!canEdit())return;clear();title.value=screenshotTitle();status.textContent='';enabled();dialog.showModal();area.focus();};
 return dialog;
}
