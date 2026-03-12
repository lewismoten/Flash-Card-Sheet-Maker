import { PDFDocument, StandardFonts } from 'pdf-lib';
import { drawCutMarks } from './drawCutMarks.js';
import { drawFlashCard } from './drawFlashCard.js';
import { drawPageTitle } from './drawPageTitle.js';
import { getBackSlotIndex } from './getBackSlotIndex.js';
import { drawBackCard } from './drawBackCard.js';

const PT_PER_INCH = 72;

const LETTER = {
  width: 8.5 * PT_PER_INCH,
  height: 11 * PT_PER_INCH,
};

export const makePdf = async (cards, config, inputPath) => {
  const pdf = await PDFDocument.create();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = LETTER.width;
  const pageHeight = LETTER.height;

  const rows = Math.max(1, Number(config.page.rows));
  const cols = Math.max(1, Number(config.page.cols));
  const margin = Number(config.page.margin);
  const gutter = Number(config.page.gutter);
  const pageTitleHeight = config.page.showPageTitle ? 20 : 0;

  const cardWidth = (pageWidth - margin * 2 - gutter * (cols - 1)) / cols;
  const cardHeight =
    (pageHeight - margin * 2 - gutter * (rows - 1) - pageTitleHeight) / rows;

  const cardsPerPage = rows * cols;
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
  const pageCards = cards.slice(
    pageIndex * cardsPerPage,
    (pageIndex + 1) * cardsPerPage
  );

  // FRONT
  const frontPage = pdf.addPage([pageWidth, pageHeight]);
  drawPageTitle(frontPage, config, inputPath, pageIndex, totalPages, "Front", fontBold);

  for (let i = 0; i < pageCards.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = margin + col * (cardWidth + gutter);
    const y =
      pageHeight -
      margin -
      pageTitleHeight -
      (row + 1) * cardHeight -
      row * gutter;

    drawFlashCard(frontPage, pageCards[i], x, y, cardWidth, cardHeight, config, font, fontBold);
    drawCutMarks(frontPage, x, y, cardWidth, cardHeight, config, pageWidth, pageHeight);
  }

  if (config.duplex?.enabled) {
    const backPage = pdf.addPage([pageWidth, pageHeight]);
    drawPageTitle(backPage, config, inputPath, pageIndex, totalPages, "Back", fontBold);

    for (let i = 0; i < pageCards.length; i++) {
      const backSlot = getBackSlotIndex(i, cols, rows, config.duplex);
      const row = Math.floor(backSlot / cols);
      const col = backSlot % cols;

      const x = margin + col * (cardWidth + gutter);
      const y =
        pageHeight -
        margin -
        pageTitleHeight -
        (row + 1) * cardHeight -
        row * gutter;

      drawBackCard(backPage, pageCards[i], x, y, cardWidth, cardHeight, config, font, fontBold);
      drawCutMarks(backPage, x, y, cardWidth, cardHeight, config, pageWidth, pageHeight);
    }
  }
}

  return pdf.save();
}