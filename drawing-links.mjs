export function drawingLabel(drawing) {
  return `${drawing.name || '名称未設定のPDF'} / ${drawing.page || 1}ページ`;
}
export function drawingLocations(drawings, photoId) {
  return drawings.filter(d => (d.annotations || []).some(a => ['number','photo-callout'].includes(a.type) && a.photoId === photoId)).map(drawingLabel);
}
