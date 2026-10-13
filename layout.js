export const defaultPhotoCounts={'A4-landscape':4,'A4-portrait':3,'A3-landscape':12,'A3-portrait':10};
export function photoLayout({paperSize='A4',orientation='landscape',photosPerPage}={}){
  const count=Math.max(1,Math.min(20,Math.floor(Number(photosPerPage))||defaultPhotoCounts[paperSize+'-'+orientation]||4));
  const cols=orientation==='landscape'?(count===1?1:count<=6?2:count<=9?3:4):(count<=5?1:2);
  return {count,cols,rows:Math.ceil(count/cols)};
}

// Rules are page boundaries: a count applies until the next rule.
export function normalizePhotoPageLayouts(rules=[]){
  const byPage=new Map();
  for(const rule of Array.isArray(rules)?rules:[]){
    if(Number.isInteger(rule?.page)&&rule.page>=0&&rule.page<=10000&&Number.isInteger(rule.count)&&rule.count>=1&&rule.count<=20)byPage.set(rule.page,rule.count);
  }
  return [...byPage].sort((a,b)=>a[0]-b[0]).map(([page,count])=>({page,count}));
}
export function photoCountAtPage(state,page){
  let count=photoLayout(state).count;
  for(const rule of normalizePhotoPageLayouts(state.photoPageLayouts)){if(rule.page>page)break;count=rule.count;}
  return count;
}
export function buildPhotoPages(state){
  const photos=state.photos||[],pages=[],rules=normalizePhotoPageLayouts(state.photoPageLayouts);
  let start=0,ruleIndex=0,count=photoLayout(state).count;
  while(start<photos.length){
    const index=pages.length;
    while(ruleIndex<rules.length&&rules[ruleIndex].page<=index)count=rules[ruleIndex++].count;
    pages.push({index,start,...photoLayout({...state,photosPerPage:count}),photos:photos.slice(start,start+count)});
    start+=count;
  }
  return pages;
}
export function changePhotoPageLayout(state,page,count,scope='page'){
  if(!Number.isInteger(page)||page<0||page>9999)throw new Error('ページ番号が不正です。');
  if(!Number.isInteger(count)||count<1||count>20)throw new Error('写真枚数は1〜20枚で指定してください。');
  if(!['page','following'].includes(scope))throw new Error('適用範囲が不正です。');
  const nextCount=photoCountAtPage(state,page+1);
  let rules=normalizePhotoPageLayouts(state.photoPageLayouts);
  if(scope==='following')rules=rules.filter(rule=>rule.page<page);
  else rules=rules.filter(rule=>rule.page!==page&&rule.page!==page+1);
  rules.push({page,count});
  if(scope==='page')rules.push({page:page+1,count:nextCount});
  let previous=photoLayout(state).count;
  state.photoPageLayouts=normalizePhotoPageLayouts(rules).filter(rule=>{const different=rule.count!==previous;previous=rule.count;return different;});
}
export function paperDimensions(paperSize='A4',landscape=true){
  const a3=paperSize==='A3',short=a3?297:210,long=a3?420:297;
  const widthMM=landscape?long:short,heightMM=landscape?short:long;
  return {widthMM,heightMM,width:landscape?(a3?2380:1684):(a3?1684:1190),height:landscape?(a3?1684:1190):(a3?2380:1684),points:[widthMM*72/25.4,heightMM*72/25.4],excelSize:a3?8:9};
}
