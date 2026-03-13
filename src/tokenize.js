export const tokenize = (text, config) => {
  const results = [];
  const pattern = /\[[^\]]+\]|_+|[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|[^\sA-Za-z0-9_]/g;
  const matches = String(text ?? '').match(pattern) || [];

  for (const token of matches) {
    const isAnchor = /^\[[^\]]+\]$/.test(token);
    const isUnderlineWord = /^_+$/.test(token);
    const isPunctuation = !isAnchor && !isUnderlineWord && /^[^A-Za-z0-9]+$/.test(token);

    if (isAnchor || isUnderlineWord) {
      results.push(token);
      continue;
    }

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