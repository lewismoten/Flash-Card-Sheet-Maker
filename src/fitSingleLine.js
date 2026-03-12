export const fitSingleLine = (text, maxWidth, fontSize, font) => {
  const ellipsis = '…';
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;

  let trimmed = text;
  while (trimmed.length > 0 && font.widthOfTextAtSize(trimmed + ellipsis, fontSize) > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed + ellipsis;
}