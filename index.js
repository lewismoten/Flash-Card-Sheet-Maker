const STORAGE_KEYS = {
  text: "flashcard_text",
  config: "flashcard_config"
};
const DEFAULT_CONFIG = {
  title: 'Declaration of Independence',
  mode: 'words',
  wordsPerCard: 3,
  wordOffset: 1,
  preserveLineBreaks: false,
  removePunctuation: false,
  separatePunctuation: false,
  transform: 'none',
  trimWhitespace: true,
  dedupeEmptyCards: true,
  page: {
    size: 'letter',
    orientation: 'portrait',
    margin: 24,
    gutter: 10,
    rows: 5,
    cols: 4,
    cutMarks: 'outer',
    cutMarkLength: 8,
    cutMarkInset: 4,
    cutMarkThickness: 0.4,
    cutMarkColor: '#C7C7C7',
    showPageTitle: false,
    pageTitleFontSize: 14
  },
  card: {
    titleFontSize: 9,
    bodyFontSize: 22,
    bodyMinFontSize: 10,
    lineHeight: 1.2,
    padding: 10,
    borderColor: '#1F4E79',
    borderWidth: 1,
    titleBandHeight: 16,
    titleColor: '#1F4E79',
    titleTextColor: '#FFFFFF',
    bodyTextColor: '#111111',
    backgroundColor: '#FFFFFF',
    align: 'center',
    verticalAlign: 'middle'
  },
  duplex: {
    enabled: true,
    showBackOrder: true,
    backLabel: 'Order',
    backOrderStyle: 'smart',
    backMaxLineLength: 22,
    backWrapThreshold: 8,
    backContextRadius: 2,
    backFontSize: 20,
    backMinFontSize: 10,
    backTitleFontSize: 9,
    backTextColor: '#111111',
    backBorderColor: '#888888',
    backBorderWidth: 1,
    mirrorForFlipLongEdge: true,
    mirrorForFlipShortEdge: false
  }
};

const SAMPLE_TEXT = `We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.`;

const state = {
  cards: [],
  pages: [],
  config: structuredClone(DEFAULT_CONFIG),
  text: SAMPLE_TEXT
};

let textInput;
let configInput;
let fileInput;
let pagesEl;
let summaryBar;

const saveState = () => {
  localStorage.setItem(STORAGE_KEYS.text, textInput.value);
  localStorage.setItem(STORAGE_KEYS.config, configInput.value);
};

const loadState = () => {
  const savedText = localStorage.getItem(STORAGE_KEYS.text);
  const savedConfig = localStorage.getItem(STORAGE_KEYS.config);

  if (savedText) textInput.value = savedText;
  if (savedConfig) configInput.value = savedConfig;
};

const rgbFromHex = (hex) => {
  const cleaned = String(hex || '#000000').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16)
  };
};

const deepMerge = (target, source) => {
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
};

const normalizeWhitespace = (text) => String(text).replace(/\s+/g, ' ').trim();

const transformText = (text, transform) => {
  const mode = String(transform || 'none').toLowerCase();
  if (mode === 'upper' || mode === 'uppercase' || mode === 'allcaps') return text.toUpperCase();
  if (mode === 'lower' || mode === 'lowercase') return text.toLowerCase();
  if (mode === 'title' || mode === 'titlecase') {
    return text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }
  return text;
};

const tokenize = (text, config) => {
  const results = [];
  const pattern = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|[^\sA-Za-z0-9]/g;
  const matches = text.match(pattern) || [];

  for (const token of matches) {
    const isPunctuation = /^[^A-Za-z0-9]+$/.test(token);

    if (isPunctuation) {
      if (config.removePunctuation) continue;
      if (config.separatePunctuation) {
        results.push(token);
      } else if (results.length) {
        results[results.length - 1] += token;
      } else {
        results.push(token);
      }
    } else {
      results.push(token);
    }
  }

  return results;
};

const splitIntoSentences = (text, config) => {
  let working = text;
  if (config.removePunctuation && !config.separatePunctuation) {
    working = working.replace(/[.,!?;:"'()\[\]{}—–-]/g, '');
  }

  const parts = working.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const results = [];

  for (const part of parts) {
    const cleaned = normalizeWhitespace(part);
    if (!cleaned) continue;
    if (config.separatePunctuation) {
      results.push(...tokenize(cleaned, { ...config, wordsPerCard: 1 }));
    } else {
      results.push(cleaned);
    }
  }

  return results;
};

const splitIntoWordGroups = (text, config) => {
  const tokens = tokenize(text, config);
  const wordsPerCard = Math.max(1, Number(config.wordsPerCard || 1));
  const offset = Number(config.wordOffset ?? 0);
  const groups = [];

  let i = 0;
  if (offset > 0) {
    const firstSize = Math.max(1, wordsPerCard - offset);
    groups.push(tokens.slice(0, firstSize).join(' '));
    i = firstSize;
  }

  while (i < tokens.length) {
    groups.push(tokens.slice(i, i + wordsPerCard).join(' '));
    i += wordsPerCard;
  }

  return groups;
};

const assignCardOrders = (cards) => {
  const keyMap = new Map();
  for (const card of cards) {
    const key = normalizeWhitespace(card.text).toUpperCase();
    if (!keyMap.has(key)) keyMap.set(key, []);
    keyMap.get(key).push(card.index);
  }

  return cards.map((card) => {
    const key = normalizeWhitespace(card.text).toUpperCase();
    return { ...card, orders: keyMap.get(key) || [card.index] };
  });
};

const formatBackOrderContext = (card, config) => {
  const label = config?.duplex?.backLabel ?? 'Order';
  const orders = Array.isArray(card.orders) ? [...card.orders] : [card.index];
  const current = card.index;
  const currentPos = orders.indexOf(current);
  if (currentPos === -1) return `${label}: ${orders.join(', ')}`;
  const radius = Number(config?.duplex?.backContextRadius ?? 1);
  const start = Math.max(0, currentPos - radius);
  const end = Math.min(orders.length, currentPos + radius + 1);
  const visible = orders.slice(start, end).map((n) => n === current ? `[${n}]` : String(n));
  if (start > 0) visible.unshift('...');
  if (end < orders.length) visible.push('...');
  return `${label}: ${visible.join(', ')}`;
};

const formatBackOrderLines = (card, config, maxLineLength = 22) => {
  const label = config?.duplex?.backLabel ?? 'Order';
  const orders = Array.isArray(card.orders) ? card.orders : [card.index];
  const parts = orders.map(String);
  const lines = [];
  let currentLine = '';

  for (const part of parts) {
    const next = currentLine ? `${currentLine}, ${part}` : part;
    if (next.length <= maxLineLength) {
      currentLine = next;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = part;
    }
  }
  if (currentLine) lines.push(currentLine);
  return { label, lines };
};

const formatBackOrderSmart = (card, config) => {
  const orders = Array.isArray(card.orders) ? card.orders : [card.index];
  const threshold = Number(config?.duplex?.backWrapThreshold ?? 8);
  if (orders.length > threshold) {
    return { label: null, lines: [formatBackOrderContext(card, config)] };
  }
  return formatBackOrderLines(card, config, config?.duplex?.backMaxLineLength ?? 22);
};

const formatBackOrderDisplay = (card, config) => {
  const style = config?.duplex?.backOrderStyle ?? 'wrap';
  const label = config?.duplex?.backLabel ?? 'Order';

  if (style === 'smart') return formatBackOrderSmart(card, config);
  if (style === 'context') return { label: null, lines: [formatBackOrderContext(card, config)] };
  if (style === 'single') {
    const orders = Array.isArray(card.orders) ? card.orders : [card.index];
    return { label: null, lines: [`${label}: ${orders.join(', ')}`] };
  }
  if (style === 'count') {
    const orders = Array.isArray(card.orders) ? card.orders : [card.index];
    return { label: null, lines: [`${label} Count: ${orders.length}`] };
  }
  return formatBackOrderLines(card, config, config?.duplex?.backMaxLineLength ?? 22);
};

const buildCards = (rawText, config) => {
  let text = String(rawText ?? '');
  if (config.trimWhitespace) {
    text = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  }
  if (config.preserveLineBreaks) {
    text = text.replace(/\n+/g, ' \n ');
  } else {
    text = text.replace(/\n+/g, ' ');
  }

  let items = [];
  if (config.mode === 'sentences') {
    items = splitIntoSentences(text, config);
  } else {
    items = splitIntoWordGroups(text, config);
  }

  const cards = items
    .map((item) => normalizeWhitespace(item))
    .filter((item) => (config.dedupeEmptyCards ? item.length > 0 : true))
    .map((item) => transformText(item, config.transform))
    .map((item, index) => ({ index: index + 1, title: config.title, text: item }));

  return assignCardOrders(cards);
};

const getLayout = (config) => {
  const dpi = 2;
  const pageWidth = 612 * dpi;
  const pageHeight = 792 * dpi;
  const margin = Number(config.page.margin) * dpi;
  const gutter = Number(config.page.gutter) * dpi;
  const rows = Math.max(1, Number(config.page.rows));
  const cols = Math.max(1, Number(config.page.cols));
  const pageTitleHeight = config.page.showPageTitle ? 20 * dpi : 0;
  const cardWidth = (pageWidth - margin * 2 - gutter * (cols - 1)) / cols;
  const cardHeight = (pageHeight - margin * 2 - gutter * (rows - 1) - pageTitleHeight) / rows;
  return { dpi, pageWidth, pageHeight, margin, gutter, rows, cols, pageTitleHeight, cardWidth, cardHeight, cardsPerPage: rows * cols };
};

const fitLines = (ctx, text, maxWidth, startFontSize, minFontSize, lineHeightRatio = 1.2) => {
  let fontSize = startFontSize;
  while (fontSize >= minFontSize) {
    ctx.font = `${fontSize}px Arial`;
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let current = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) current = next;
      else {
        lines.push(current);
        current = words[i];
      }
    }
    if (current) lines.push(current);
    return { fontSize, lines, lineHeight: fontSize * lineHeightRatio };
  }
  return { fontSize: minFontSize, lines: [text], lineHeight: minFontSize * lineHeightRatio };
};

const drawPageTitle = (ctx, config, side, pageIndex, totalPages, width, margin) => {
  if (!config.page.showPageTitle) return;
  ctx.fillStyle = '#333344';
  ctx.font = `700 ${Number(config.page.pageTitleFontSize) * 2}px Arial`;
  ctx.textBaseline = 'top';
  const label = `${config.title} • ${side} • Page ${pageIndex + 1} of ${totalPages}`;
  ctx.fillText(label, margin, margin / 2);
};

const drawCutMarks = (ctx, x, y, width, height, layout, config) => {
  const mode = config.page.cutMarks || 'grid';
  const color = rgbFromHex(config.page.cutMarkColor);
  const len = Number(config.page.cutMarkLength) * layout.dpi;
  const inset = Number(config.page.cutMarkInset) * layout.dpi;
  const thickness = Math.max(1, Number(config.page.cutMarkThickness) * layout.dpi);
  const margin = layout.margin;
  const pageWidth = layout.pageWidth;
  const pageHeight = layout.pageHeight;

  const isLeftEdge = x <= margin + 1;
  const isRightEdge = x + width >= pageWidth - margin - 1;
  const isTopEdge = y <= margin + 1 + layout.pageTitleHeight;
  const isBottomEdge = y + height >= pageHeight - margin - 1;

  ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
  ctx.lineWidth = thickness;

  const drawSeg = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const shouldOuter = mode === 'outer';
  const shouldAll = mode === 'grid';

  if (shouldAll || (shouldOuter && isTopEdge)) {
    drawSeg(x, y - inset, x, y - inset - len);
    drawSeg(x + width, y - inset, x + width, y - inset - len);
  }
  if (shouldAll || (shouldOuter && isBottomEdge)) {
    drawSeg(x, y + height + inset, x, y + height + inset + len);
    drawSeg(x + width, y + height + inset, x + width, y + height + inset + len);
  }
  if (shouldAll || (shouldOuter && isLeftEdge)) {
    drawSeg(x - inset, y, x - inset - len, y);
    drawSeg(x - inset, y + height, x - inset - len, y + height);
  }
  if (shouldAll || (shouldOuter && isRightEdge)) {
    drawSeg(x + width + inset, y, x + width + inset + len, y);
    drawSeg(x + width + inset, y + height, x + width + inset + len, y + height);
  }
};

const getBackSlotIndex = (slotIndex, cols, rows, duplexConfig = {}) => {
  const { mirrorForFlipLongEdge = true, mirrorForFlipShortEdge = false } = duplexConfig;
  const row = Math.floor(slotIndex / cols);
  const col = slotIndex % cols;
  let newRow = row;
  let newCol = col;
  if (mirrorForFlipLongEdge) newCol = cols - 1 - col;
  if (mirrorForFlipShortEdge) newRow = rows - 1 - row;
  return newRow * cols + newCol;
};

const renderFrontCard = (ctx, card, x, y, width, height, config) => {
  const border = rgbFromHex(config.card.borderColor);
  const bg = rgbFromHex(config.card.backgroundColor);
  const titleBg = rgbFromHex(config.card.titleColor);
  const titleText = rgbFromHex(config.card.titleTextColor);
  const bodyText = rgbFromHex(config.card.bodyTextColor);
  const padding = Number(config.card.padding) * 2;
  const titleBandHeight = Number(config.card.titleBandHeight) * 2;
  const borderWidth = Number(config.card.borderWidth) * 2;

  ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
  ctx.strokeStyle = `rgb(${border.r}, ${border.g}, ${border.b})`;
  ctx.lineWidth = borderWidth;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = `rgb(${titleBg.r}, ${titleBg.g}, ${titleBg.b})`;
  ctx.fillRect(x, y, width, titleBandHeight);

  ctx.fillStyle = `rgb(${titleText.r}, ${titleText.g}, ${titleText.b})`;
  ctx.font = `700 ${Number(config.card.titleFontSize) * 2}px Arial`;
  ctx.textBaseline = 'top';
  ctx.fillText(card.title, x + padding, y + 4);

  const bodyX = x + padding;
  const bodyY = y + titleBandHeight + padding;
  const bodyW = width - padding * 2;
  const bodyH = height - titleBandHeight - padding * 2;

  let fontSize = Number(config.card.bodyFontSize) * 2;
  const minFontSize = Number(config.card.bodyMinFontSize) * 2;
  let lines = [];
  let lineHeight = fontSize * Number(config.card.lineHeight);

  while (fontSize >= minFontSize) {
    ctx.font = `${fontSize}px Arial`;
    const words = String(card.text).split(/\s+/).filter(Boolean);
    lines = [];
    let current = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`;
      if (ctx.measureText(next).width <= bodyW) current = next;
      else {
        lines.push(current);
        current = words[i];
      }
    }
    if (current) lines.push(current);

    lineHeight = fontSize * Number(config.card.lineHeight);
    if (lines.length * lineHeight <= bodyH) break;
    fontSize -= 2;
  }

  ctx.fillStyle = `rgb(${bodyText.r}, ${bodyText.g}, ${bodyText.b})`;
  ctx.font = `${fontSize}px Arial`;
  ctx.textBaseline = 'middle';
  const totalHeight = lines.length * lineHeight;
  let startY = bodyY + bodyH / 2 - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line, index) => {
    const textWidth = ctx.measureText(line).width;
    let textX = bodyX;
    if (config.card.align === 'center') textX = bodyX + (bodyW - textWidth) / 2;
    if (config.card.align === 'right') textX = bodyX + bodyW - textWidth;
    ctx.fillText(line, textX, startY + index * lineHeight);
  });
};

const renderBackCard = (ctx, card, x, y, width, height, config) => {
  const border = rgbFromHex(config.duplex.backBorderColor || '#888888');
  const text = rgbFromHex(config.duplex.backTextColor || '#111111');
  const padding = Number(config.card.padding) * 2;
  const titleSize = Number(config.duplex.backTitleFontSize || 9) * 2;
  const startBodySize = Number(config.duplex.backFontSize || 20) * 2;
  const minBodySize = Number(config.duplex.backMinFontSize || 10) * 2;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = `rgb(${border.r}, ${border.g}, ${border.b})`;
  ctx.lineWidth = Number(config.duplex.backBorderWidth || 1) * 2;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = `rgb(${text.r}, ${text.g}, ${text.b})`;
  ctx.font = `700 ${titleSize}px Arial`;
  ctx.textBaseline = 'top';
  ctx.fillText(card.title, x + padding, y + padding / 2);

  const { label, lines } = formatBackOrderDisplay(card, config);
  const renderedLines = label ? [`${label}:`, ...lines] : lines;
  const availableHeight = height - padding * 2 - titleSize - 12;
  let fontSize = startBodySize;
  let lineHeight = fontSize * 1.2;

  while (fontSize >= minBodySize) {
    lineHeight = fontSize * 1.2;
    if (renderedLines.length * lineHeight <= availableHeight) break;
    fontSize -= 2;
  }

  const totalTextHeight = renderedLines.length * lineHeight;
  const startY = y + titleSize + padding + ((height - titleSize - padding * 2) / 2) - (totalTextHeight / 2) + (lineHeight / 2);

  renderedLines.forEach((line, index) => {
    const isLabelLine = label && index === 0;
    ctx.font = `${isLabelLine ? '700 ' : ''}${fontSize}px Arial`;
    const textWidth = ctx.measureText(line).width;
    ctx.textBaseline = 'middle';
    ctx.fillText(line, x + (width - textWidth) / 2, startY + index * lineHeight);
  });
};

const buildPages = (cards, config) => {
  const layout = getLayout(config);
  const totalSheets = Math.ceil(cards.length / layout.cardsPerPage);
  const pages = [];

  for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
    const sheetCards = cards.slice(sheetIndex * layout.cardsPerPage, (sheetIndex + 1) * layout.cardsPerPage);
    pages.push({ side: 'Front', sheetIndex, cards: sheetCards });

    if (config.duplex?.enabled) {
      const backSlots = new Array(layout.cardsPerPage).fill(null);
      sheetCards.forEach((card, i) => {
        const target = getBackSlotIndex(i, layout.cols, layout.rows, config.duplex);
        backSlots[target] = card;
      });
      pages.push({ side: 'Back', sheetIndex, cards: backSlots.filter((card) => card !== undefined) });
      pages[pages.length - 1].slotCards = backSlots;
    }
  }

  return { pages, layout, totalSheets };
};

const renderPageCanvas = (pageModel, config, layout, totalSheets) => {
  const canvas = document.createElement('canvas');
  canvas.width = layout.pageWidth;
  canvas.height = layout.pageHeight;
  canvas.className = 'preview-page';
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPageTitle(ctx, config, pageModel.side, pageModel.sheetIndex, totalSheets, layout.pageWidth, layout.margin);

  const cardsSource = pageModel.slotCards || pageModel.cards;
  cardsSource.forEach((card, i) => {
    if (!card) return;
    const row = Math.floor(i / layout.cols);
    const col = i % layout.cols;
    const x = layout.margin + col * (layout.cardWidth + layout.gutter);
    const y = layout.margin + layout.pageTitleHeight + row * (layout.cardHeight + layout.gutter);

    if (pageModel.side === 'Front') renderFrontCard(ctx, card, x, y, layout.cardWidth, layout.cardHeight, config);
    else renderBackCard(ctx, card, x, y, layout.cardWidth, layout.cardHeight, config);

    drawCutMarks(ctx, x, y, layout.cardWidth, layout.cardHeight, layout, config);
  });

  return canvas;
};

const renderAll = () => {
  try {
    const config = deepMerge(structuredClone(DEFAULT_CONFIG), JSON.parse(configInput.value));
    const cards = buildCards(textInput.value, config);
    const { pages, layout } = buildPages(cards, config);

    state.config = config;
    state.cards = cards;
    state.pages = pages;

    pagesEl.innerHTML = '';
    pages.forEach((pageModel, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'page-card';
      const title = document.createElement('h3');
      title.textContent = `Page ${index + 1} • ${pageModel.side} • Sheet ${pageModel.sheetIndex + 1}`;
      wrap.appendChild(title);
      wrap.appendChild(renderPageCanvas(pageModel, config, layout, Math.ceil(cards.length / layout.cardsPerPage)));
      pagesEl.appendChild(wrap);
    });

    summaryBar.innerHTML = `
      <span><strong>Cards:</strong> ${cards.length}</span>
      <span><strong>Pages:</strong> ${pages.length}</span>
      <span><strong>Mode:</strong> ${config.mode}</span>
      <span><strong>Grid:</strong> ${config.page.rows} × ${config.page.cols}</span>
    `;

    saveState();
  } catch (error) {
    alert(`Config error: ${error.message}`);
  }
};

const exportPdf = async () => {
  renderAll();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

  const canvases = Array.from(document.querySelectorAll('canvas.preview-page'));
  canvases.forEach((canvas, index) => {
    if (index > 0) doc.addPage('letter', 'portrait');
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, 612, 792, undefined, 'FAST');
  });

  const filename = `${(state.config.title || 'flash-cards').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
  doc.save(filename);
};

const loadSample = () => {
  textInput.value = SAMPLE_TEXT;
  configInput.value = JSON.stringify(DEFAULT_CONFIG, null, 2);
  renderAll();
};

const resetAll = () => {
  localStorage.removeItem(STORAGE_KEYS.text);
  localStorage.removeItem(STORAGE_KEYS.config);

  textInput.value = "";
  configInput.value = JSON.stringify(DEFAULT_CONFIG, null, 2);

  pagesEl.innerHTML = "";

  summaryBar.innerHTML =
    '<span><strong>Cards:</strong> 0</span>' +
    '<span><strong>Pages:</strong> 0</span>' +
    '<span><strong>Mode:</strong> —</span>';
};

const main = () => {
  textInput = document.getElementById('textInput');
  configInput = document.getElementById('configInput');
  fileInput = document.getElementById('fileInput');
  pagesEl = document.getElementById('pages');
  summaryBar = document.getElementById('summaryBar');

  document.getElementById('renderBtn').addEventListener('click', renderAll);
  document.getElementById('pdfBtn').addEventListener('click', exportPdf);
  document.getElementById('sampleBtn').addEventListener('click', loadSample);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  textInput.addEventListener("input", saveState);
  configInput.addEventListener("input", saveState);

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    textInput.value = text;
    renderAll();
  });

  configInput.value = JSON.stringify(DEFAULT_CONFIG, null, 2);

  loadState();

  if (!textInput.value) {
    textInput.value = state.text;
  }

  renderAll();
}

window.addEventListener('load', main);