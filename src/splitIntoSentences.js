import { tokenize } from './tokenize.js';
import { normalizeWhitespace } from './normalizeWhitespace.js';

export const splitIntoSentences = (text, config) => {
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
      const tokens = tokenize(cleaned, { ...config, mode: 'words', wordsPerCard: 1 });
      results.push(...tokens);
    } else {
      results.push(cleaned);
    }
  }

  return results;
}