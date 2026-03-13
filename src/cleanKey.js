import { normalizeWhitespace } from "./normalizeWhitespace.js";
import { stripAnchorMarkup } from "./stripAnchorMarkup.js";

export const cleanKey = text =>
  normalizeWhitespace(stripAnchorMarkup(text))
  .toUpperCase();
