export const normalizeCardKey = text => 
  String(text)
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();