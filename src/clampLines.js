import { fitSingleLine } from './fitSingleLine.js';

export const clampLines = (lines, maxWidth, font, fontSize, maxHeight, config) => {
  const maxLines = Math.max(1, Math.floor(maxHeight / (fontSize * Number(config.card.lineHeight))));
  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = fitSingleLine(kept[maxLines - 1], maxWidth, fontSize, font);
  return kept;
}