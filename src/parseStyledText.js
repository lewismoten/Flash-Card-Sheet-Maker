export const parseStyledText = (text) => {
  const input = String(text ?? '');
  const segments = [];
  const regex = /\[([^\]]+)\]|([^\[]+)/g;

  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      segments.push({
        text: match[1],
        anchor: true,
      });
    } else if (match[2]) {
      segments.push({
        text: match[2],
        anchor: false,
      });
    }
  }

  return segments.filter((segment) => segment.text.length > 0);
};