export function instructionText(photo){
  return [['指示先',photo.recipient],['期限',photo.dueDate],['対応内容',photo.comment]]
    .filter(([,value])=>value).map(([label,value])=>label+'：'+value).join('\n');
}
