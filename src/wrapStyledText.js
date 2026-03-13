import { parseStyledText } from './parseStyledText.js';
import { stripAnchorMarkup } from './stripAnchorMarkup.js';

export const wrapStyledText = (text, maxWidth, regularFont, boldFont, fontSize, config) => {
  const segments = config?.anchors?.enabled === false
    ? [{ text: stripAnchorMarkup(text), anchor: false }]
    : parseStyledText(text);

  const tokens = [];

  for (const segment of segments) {
    const parts = segment.text.split(/(\s+)/).filter((part) => part.length > 0);

    for (const part of parts) {
      tokens.push({
        text: part,
        anchor: segment.anchor,
      });
    }
  }

  const lines = [];
  let currentLine = [];
  let currentWidth = 0;

  for (const token of tokens) {
    const activeFont = token.anchor ? boldFont : regularFont;
    const tokenWidth = activeFont.widthOfTextAtSize(token.text, fontSize);

    if (currentLine.length > 0 && currentWidth + tokenWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = [token];
      currentWidth = tokenWidth;
    } else {
      currentLine.push(token);
      currentWidth += tokenWidth;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};