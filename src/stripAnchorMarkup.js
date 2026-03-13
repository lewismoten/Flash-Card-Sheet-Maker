export const stripAnchorMarkup = text => 
  String(text ?? '').replace(/\[([^\]]+)\]/g, '$1');
