import { splitIntoSentences } from './splitIntoSentences.js';
import { splitIntoWordGroups } from './splitIntoWordGroups.js';
import { splitIntoLines } from './splitIntoLines.js';
import { normalizeWhitespace } from './normalizeWhitespace.js';
import { transformText } from './transformText.js';

export const buildCards = (rawText, config) => {
  let text = String(rawText ?? '');

  if (config.trimWhitespace) {
    text = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  }

  if (config.mode === 'lines') {
    // Consolidate line breaks
    text = text.replace(/[\s\n]*\n[\s\n]*/g, '\n');
  } else if (config.preserveLineBreaks) {
    text = text.replace(/\n+/g, ' \n ');
  } else {
    text = text.replace(/\n+/g, ' ');
  }

  let items = [];

  if (config.mode === 'sentences') {
    items = splitIntoSentences(text, config);
  } else if (config.mode === 'words') {
    items = splitIntoWordGroups(text, config);
  } else if (config.mode === "lines") {
    groups = splitIntoLines(text, config);
  } else {
    throw new Error(`Unsupported mode: ${config.mode}`);
  }

  items = items
    .map((item) => normalizeWhitespace(item))
    .filter((item) => (config.dedupeEmptyCards ? item.length > 0 : true))
    .map((item) => transformText(item, config.transform));

  return items.map((text, index) => ({
    index: index + 1,
    title: config.title,
    text,
  }));
}
