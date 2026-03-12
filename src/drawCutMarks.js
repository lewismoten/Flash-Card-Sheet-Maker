import { hexToRgb } from "./hexToRgb.js";

export const drawCutMarks = (page, x, y, width, height, config, pageWidth, pageHeight) => {
  const cutColor = hexToRgb(config.page.cutMarkColor);
  const len = Number(config.page.cutMarkLength);
  const inset = Number(config.page.cutMarkInset);
  const thickness = Number(config.page.cutMarkThickness);

  const left = x;
  const right = x + width;
  const bottom = y;
  const top = y + height;

  const segments = [];

  const isLeftEdge = left <= config.page.margin + 0.5;
  const isRightEdge = right >= pageWidth - config.page.margin - 0.5;
  const isTopEdge = top >= pageHeight - config.page.margin - 0.5;
  const isBottomEdge = bottom <= config.page.margin + 0.5;

  if (isTopEdge) {
    segments.push([[left, top + inset], [left, top + inset + len]]);
    segments.push([[right, top + inset], [right, top + inset + len]]);
  }

  if (isBottomEdge) {
    segments.push([[left, bottom - inset], [left, bottom - inset - len]]);
    segments.push([[right, bottom - inset], [right, bottom - inset - len]]);
  }

  if (isLeftEdge) {
    segments.push([[left - inset - len, top], [left - inset, top]]);
    segments.push([[left - inset - len, bottom], [left - inset, bottom]]);
  }

  if (isRightEdge) {
    segments.push([[right + inset, top], [right + inset + len, top]]);
    segments.push([[right + inset, bottom], [right + inset + len, bottom]]);
  }

  for (const [[x1, y1], [x2, y2]] of segments) {
    if (x1 < 0 || x2 < 0 || x1 > pageWidth || x2 > pageWidth || y1 < 0 || y2 < 0 || y1 > pageHeight || y2 > pageHeight) {
      continue;
    }

    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color: cutColor,
    });
  }
}