export const tokenize = (text, config) => {
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
}