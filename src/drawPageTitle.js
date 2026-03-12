import path from "node:path";
import { rgb } from "pdf-lib";

export const drawPageTitle = (
  page,
  config,
  inputPath,
  pageIndex,
  totalPages,
  side,
  fontBold
) => {
  if (!config.page?.showPageTitle) return;

  const margin = Number(config.page.margin);
  const fontSize = Number(config.page.pageTitleFontSize || 14);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  const sourceName = path.basename(inputPath);

  const label = `${config.title} • ${side} • Page ${
    pageIndex + 1
  } of ${totalPages} • ${sourceName}`;

  page.drawText(label, {
    x: margin,
    y: pageHeight - margin + 2,
    size: fontSize,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
};