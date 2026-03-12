import { hexToRgb } from "./hexToRgb.js";
import { fitParagraph } from './fitParagraph.js';
import { fitSingleLine } from './fitSingleLine.js';

export const drawFlashCard = (page, card, x, y, width, height, config, font, fontBold) => {
  const borderColor = hexToRgb(config.card.borderColor);
  const bgColor = hexToRgb(config.card.backgroundColor);
  const titleColor = hexToRgb(config.card.titleColor);
  const titleTextColor = hexToRgb(config.card.titleTextColor);
  const bodyTextColor = hexToRgb(config.card.bodyTextColor);
  const borderWidth = Number(config.card.borderWidth);
  const padding = Number(config.card.padding);
  const titleBandHeight = Number(config.card.titleBandHeight);

  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderWidth,
    borderColor,
    color: bgColor,
  });

  page.drawRectangle({
    x,
    y: y + height - titleBandHeight,
    width,
    height: titleBandHeight,
    color: titleColor,
  });

  const titleText = fitSingleLine(card.title, width - padding * 2, Number(config.card.titleFontSize), fontBold);
  page.drawText(titleText, {
    x: x + padding,
    y: y + height - titleBandHeight + 4,
    size: Number(config.card.titleFontSize),
    font: fontBold,
    color: titleTextColor,
  });

  const bodyArea = {
    x: x + padding,
    y: y + padding,
    width: width - padding * 2,
    height: height - titleBandHeight - padding * 2,
  };

  const fitted = fitParagraph(card.text, bodyArea.width, bodyArea.height, config, font);
  const lineHeight = fitted.fontSize * Number(config.card.lineHeight);
  const totalTextHeight = fitted.lines.length * lineHeight;

  let startY;
  if (config.card.verticalAlign === 'top') {
    startY = bodyArea.y + bodyArea.height - fitted.fontSize;
  } else if (config.card.verticalAlign === 'bottom') {
    startY = bodyArea.y + totalTextHeight - lineHeight;
  } else {
    startY = bodyArea.y + (bodyArea.height + totalTextHeight) / 2 - lineHeight;
  }

  for (let i = 0; i < fitted.lines.length; i++) {
    const line = fitted.lines[i];
    const lineWidth = font.widthOfTextAtSize(line, fitted.fontSize);
    let textX = bodyArea.x;

    if (config.card.align === 'center') {
      textX = bodyArea.x + (bodyArea.width - lineWidth) / 2;
    } else if (config.card.align === 'right') {
      textX = bodyArea.x + bodyArea.width - lineWidth;
    }

    page.drawText(line, {
      x: textX,
      y: startY - i * lineHeight,
      size: fitted.fontSize,
      font,
      color: bodyTextColor,
    });
  }
}
