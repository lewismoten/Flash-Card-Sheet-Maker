import { hexToRgb } from "./hexToRgb.js";
import { fitSingleLine } from './fitSingleLine.js';
import { getAnchorStyle } from "./getAnchorStyle.js";
import { fitStyledParagraph } from "./fitStyledParagraph.js";

export const drawFlashCard = (page, card, x, y, width, height, config, font, fontBold) => {
  const borderColor = hexToRgb(config.card.borderColor);
  const bgColor = hexToRgb(config.card.backgroundColor);
  const titleColor = hexToRgb(config.card.titleColor);
  const titleTextColor = hexToRgb(config.card.titleTextColor);
  const bodyTextColor = hexToRgb(config.card.bodyTextColor);
  const borderWidth = Number(config.card.borderWidth);
  const padding = Number(config.card.padding);
  const titleBandHeight = Number(config.card.titleBandHeight);
  const anchorStyle = getAnchorStyle(config);

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

  const anchorColor = hexToRgb(anchorStyle.color);

  const fitted = fitStyledParagraph(
    card.text,
    bodyArea.width,
    bodyArea.height,
    config,
    font,
    fontBold
  );

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
    const lineTokens = fitted.lines[i];

    const lineWidth = lineTokens.reduce((sum, token) => {
      const activeFont = token.anchor && anchorStyle.useBold ? fontBold : font;
      return sum + activeFont.widthOfTextAtSize(token.text, fitted.fontSize);
    }, 0);

    let textX = bodyArea.x;

    if (config.card.align === 'center') {
      textX = bodyArea.x + (bodyArea.width - lineWidth) / 2;
    } else if (config.card.align === 'right') {
      textX = bodyArea.x + bodyArea.width - lineWidth;
    }

    let cursorX = textX;

    for (const token of lineTokens) {
      const activeFont = token.anchor && anchorStyle.useBold ? fontBold : font;
      const activeColor = token.anchor && anchorStyle.useColor ? anchorColor : bodyTextColor;

      page.drawText(token.text, {
        x: cursorX,
        y: startY - i * lineHeight,
        size: fitted.fontSize,
        font: activeFont,
        color: activeColor,
      });

      cursorX += activeFont.widthOfTextAtSize(token.text, fitted.fontSize);
    }
  }
}
