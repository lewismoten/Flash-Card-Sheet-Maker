import { stripAnchorMarkup } from "./stripAnchorMarkup.js";

export const countTokenWords = (token) => {
  const plain = stripAnchorMarkup(token).trim();
  if (!plain) return 0;

  if (/^_+$/.test(plain)) return 1;

  if (/^[^A-Za-z0-9_]+$/.test(plain)) return 0;

  return plain.split(/\s+/).filter(Boolean).length;
};
