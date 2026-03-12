import { tokenize } from './tokenize.js';

export const splitIntoWordGroups = (text, config) => {
  const tokens = tokenize(text, config);
  const wordsPerCard = Math.max(1, Number(config.wordsPerCard || 1));
  const groups = [];

  const offset = Number(config.wordOffset ?? 0);

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
}