import { clampLines } from './clampLines.js';
import { wrapText } from './wrapText.js';

export const fitParagraph = (text, maxWidth, maxHeight, config, font) => {
  let fontSize = Number(config.card.bodyFontSize);
  const minFontSize = Number(config.card.bodyMinFontSize);

  while (fontSize >= minFontSize) {
    const lines = wrapText(text, maxWidth, font, fontSize);
    const lineHeight = fontSize * Number(config.card.lineHeight);
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      return { fontSize, lines };
    }

    fontSize -= 1;
  }

  const lines = wrapText(text, maxWidth, font, minFontSize);
  return { fontSize: minFontSize, lines: clampLines(lines, maxWidth, font, minFontSize, maxHeight, config) };
}