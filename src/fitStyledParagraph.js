import { wrapStyledText } from './wrapStyledText.js';

export const fitStyledParagraph = (text, maxWidth, maxHeight, config, regularFont, boldFont) => {
  let fontSize = Number(config.card.bodyFontSize);
  const minFontSize = Number(config.card.bodyMinFontSize);
  const lineHeightRatio = Number(config.card.lineHeight);

  while (fontSize >= minFontSize) {
    const lines = wrapStyledText(text, maxWidth, regularFont, boldFont, fontSize, config);
    const lineHeight = fontSize * lineHeightRatio;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      return { fontSize, lines };
    }

    fontSize -= 1;
  }

  return {
    fontSize: minFontSize,
    lines: wrapStyledText(text, maxWidth, regularFont, boldFont, minFontSize, config),
  };
};