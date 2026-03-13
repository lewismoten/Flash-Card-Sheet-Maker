export const splitIntoLines = (text, config = {}) => {
  const removeEmpty = config?.removeEmptyLines ?? true;
  const trim = config?.trimLines ?? true;

  let lines = text.split(/\r?\n/);

  if (trim) {
    lines = lines.map(line => line.trim());
  }

  if (removeEmpty) {
    lines = lines.filter(line => line.length > 0);
  }

  return lines;
};