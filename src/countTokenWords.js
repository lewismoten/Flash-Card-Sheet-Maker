import { stripAnchorMarkup } from "./stripAnchorMarkup.js";

export const countTokenWords = (token) => {
  const plain = stripAnchorMarkup(token).trim();
  if (!plain) return 0;

  // punctuation-only token counts as 0 words
  if (/^[^A-Za-z0-9]+$/.test(plain)) return 0;

  return plain.split(/\s+/).filter(Boolean).length;
};

