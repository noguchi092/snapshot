import {paperDimensions} from './layout.js?v=20261013-page-layouts';
import {PHOTO_WIDTH,PHOTO_GAP,photoPageSpace} from './photo-space.mjs?v=20261015-screenshot';
const instructionText=p=>p.comment||'';
const colName=i=>{let name='';for(i++;i;i=Math.floor((i-1)/26))name=String.fromCharCode(65+(i-1)%26)+name;return name;};
// Use the PDF canvas coordinates, with editable Excel cells in the text regions.
export function excelPhotoPages({pages,photos,meta,paperSize,land,media,qrId,cell,ns,rel,esc,dynamicStyles}){
 const dims=paperDimensions(paperSize,land),scale=(land?1000:700)/dims.width,W=dims.width,H=dims.height,{margin,top,bottom}=photoPageSpace(W,H,land),gap=PHOTO_GAP;
 const width=W*scale,height=H*scale,columns=50,rowCount=240,colWidth=width/columns,rowHeight=height/rowCount;
 const sheets=[];
 for(const layout of pages){
  const rows=new Map(),merges=[],images=[],cells=new Set();
  function text(value,x,y,w,h,font=20,bold=false,border=false){
   const c=Math.max(0,Math.min(columns-1,Math.round(x*scale/colWidth))),r=Math.max(1,Math.min(rowCount,Math.round(y*scale/rowHeight)+1));
   const endCol=Math.max(c,Math.min(columns-1,Math.floor((x+w)*scale/colWidth)-1)),endRow=Math.max(r,Math.min(rowCount,Math.round((y+h)*scale/rowHeight)));
   const ref=colName(c)+r;if(cells.has(ref))throw new Error('Excelの文字配置が重なっています。');cells.add(ref);
   const style=4+dynamicStyles.length;dynamicStyles.push({font:font*scale*.75,bold,border});
   if(endCol!==c||endRow!==r)merges.push(ref+':'+colName(endCol)+endRow);
   rows.set(r,(rows.get(r)||'')+cell(ref,value,style));
  }
  function image(data,x,y,w,h){const mediaId=media.length+1;media.push({id:mediaId,data,ext:'jpg'});images.push({mediaId,col:0,row:0,x:x*scale,y:y*scale,w:w*scale,h:h*scale});}
  text(meta.title,margin,margin,W-margin*2-230,43,30,true);
  text(meta.date,W-margin-220,margin,220,43,20);
  text(meta.project,margin,margin+50,W-margin*2-250,42,18);
  text(layout.photos.filter(p=>!p.blank).length+'枚 / '+layout.photos.length+'枠',W-margin-220,margin+62,220,30);
  const cw=(W-margin*2-gap*(layout.cols-1))/layout.cols,ch=(bottom-top-gap*(layout.rows-1))/layout.rows;
  for(let j=0;j<layout.count;j++){
   const p=photos[layout.start+j];if(!p)continue;
   const x=margin+(j%layout.cols)*(cw+gap),y=top+Math.floor(j/layout.cols)*(ch+gap),iw=cw*PHOTO_WIDTH;
   // One canvas per photo region preserves the PDF badge and white-space placement.
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(iw));canvas.height=Math.max(1,Math.round(ch));const g=canvas.getContext('2d');g.fillStyle='white';g.fillRect(0,0,canvas.width,canvas.height);
   if(!p.blank){const ratio=Math.min((iw-2)/p.w,(ch-2)/p.h),w=p.w*ratio,h=p.h*ratio;g.drawImage(p.editedCanvas||p.img,1+(iw-2-w)/2,1+(ch-2-h)/2,w,h);const bw=Math.min(52,cw*.14),bh=bw*.77;g.fillStyle='#087ce8';g.fillRect(8,8,bw,bh);g.fillStyle='white';g.font='bold '+bh*.63+'px sans-serif';g.textAlign='center';g.fillText(String(p.nativeNumber||photos.slice(0,layout.start+j+1).filter(p=>!p.blank).length),8+bw/2,8+bh*.72);}
   g.strokeStyle='#c8d4d8';g.lineWidth=1;g.strokeRect(.5,.5,canvas.width-1,canvas.height-1);image(canvas.toDataURL('image/jpeg',.94).split(',')[1],x,y,iw,ch);
   const font=Math.min(20,Math.max(12,Math.min(ch/13,(cw-iw)/10)));
   text(p.blank?'':instructionText(p),x+iw,y,cw-iw,ch,font,false,true);
  }
  const footerY=H-76;
  images.push({mediaId:qrId,col:0,row:0,x:margin*scale,y:footerY*scale,w:64*scale,h:64*scale});
  text('セコカンの写真指示ツール',margin+74,footerY+18,320,40,15);
  text(meta.date+' / 写真台帳 '+(layout.index+1)+' / '+pages.length,W-margin-440,footerY+18,440,40,15);
  for(const image of images){const x=image.x,y=image.y;image.col=Math.floor(x/colWidth);image.row=Math.floor(y/rowHeight);image.x=x-image.col*colWidth;image.y=y-image.row*rowHeight;}
  const sheetRows=Array.from({length:rowCount},(_,i)=>`<row r="${i+1}" ht="${(rowHeight*.75).toFixed(6)}" customHeight="1">${rows.get(i+1)||''}</row>`).join('');
  sheets.push({name:'写真台帳'+(layout.index+1),landscape:land,images,last:rowCount,lastCol:colName(columns-1),xml:`<worksheet xmlns="${ns}" xmlns:r="${rel}"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${colName(columns-1)}${rowCount}"/><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><sheetFormatPr defaultRowHeight="${rowHeight*.75}"/><cols><col min="1" max="${columns}" width="${((colWidth-5)/7).toFixed(6)}" customWidth="1"/></cols><sheetData>${sheetRows}</sheetData><mergeCells count="${merges.length}">${merges.map(ref=>`<mergeCell ref="${esc(ref)}"/>`).join('')}</mergeCells><printOptions horizontalCentered="1"/><pageMargins left="0" right="0" top="0" bottom="0" header="0" footer="0"/><pageSetup paperSize="${dims.excelSize}" orientation="${land?'landscape':'portrait'}" fitToWidth="1" fitToHeight="1"/><drawing r:id="rId1"/></worksheet>`});
 }
 return sheets;
}
