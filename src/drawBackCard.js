import { rgb } from 'pdf-lib';
import { hexToRgb } from './hexToRgb.js';
import { formatBackOrderDisplay } from './formatBackOrderDisplay.js';

export const drawBackCard = (
  page,
  card,
  x,
  y,
  width,
  height,
  config,
  font,
  fontBold
) => {
  const padding = Number(config.card?.padding ?? 10);
  const borderWidth = Number(config.duplex?.backBorderWidth ?? 1);

  const borderColor = hexToRgb(config.duplex?.backBorderColor ?? '#888888');
  const textColor = hexToRgb(config.duplex?.backTextColor ?? '#111111');
  const bgColor = rgb(1, 1, 1);

  const titleSize = Number(config.duplex?.backTitleFontSize ?? 9);
  const bodySize = Number(config.duplex?.backFontSize ?? 20);
  const lineHeight = bodySize * 1.2;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderWidth,
    borderColor,
    color: bgColor,
  });

  const title = card.title ?? '';
  const { label, lines } = formatBackOrderDisplay(card, config);

  if (title && titleSize > 0) {
    page.drawText(title, {
      x: x + padding,
      y: y + height - padding - titleSize,
      size: titleSize,
      font: fontBold,
      color: textColor,
    });
  }

  const renderedLines = label ? [`${label}:`, ...lines] : lines;
  const totalTextHeight = renderedLines.length * lineHeight;
  const startY = y + (height + totalTextHeight) / 2 - bodySize;

  renderedLines.forEach((line, index) => {
    const activeFont = index === 0 && label ? fontBold : font;
    const textWidth = activeFont.widthOfTextAtSize(line, bodySize);

    page.drawText(line, {
      x: x + (width - textWidth) / 2,
      y: startY - index * lineHeight,
      size: bodySize,
      font: activeFont,
      color: textColor,
    });
  });
};