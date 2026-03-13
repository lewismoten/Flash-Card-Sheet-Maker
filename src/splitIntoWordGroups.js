import { tokenize } from './tokenize.js';
import { countTokenWords } from './countTokenWords.js';

export const splitIntoWordGroups = (text, config) => {
  const tokens = tokenize(text, config);
  const wordsPerCard = Math.max(1, Number(config.wordsPerCard || 1));
  const offset = Math.max(0, Number(config.wordOffset ?? 0));
  const groups = [];

  let currentGroup = [];
  let currentWordCount = 0;
  let targetWordCount = wordsPerCard - offset;

  if (targetWordCount < 1) {
    targetWordCount = 1;
  }

  for (const token of tokens) {
    const tokenWordCount = countTokenWords(token);

    if (tokenWordCount === 0) {
      if (currentGroup.length === 0) {
        currentGroup.push(token);
      } else {
        currentGroup[currentGroup.length - 1] += token;
      }
      continue;
    }

    if (
      currentGroup.length > 0 &&
      currentWordCount + tokenWordCount > targetWordCount
    ) {
      groups.push(currentGroup.join(' '));
      currentGroup = [];
      currentWordCount = 0;
      targetWordCount = wordsPerCard;
    }

    currentGroup.push(token);
    currentWordCount += tokenWordCount;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup.join(' '));
  }

  return groups;
};