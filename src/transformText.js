import { toTitleCase } from './toTitleCase.js';

export const transformText = (text, transform) => {
  switch ((transform || 'none').toLowerCase()) {
    case 'upper':
    case 'uppercase':
    case 'allcaps':
      return text.toUpperCase();
    case 'lower':
    case 'lowercase':
      return text.toLowerCase();
    case 'title':
    case 'titlecase':
      return toTitleCase(text);
    case 'none':
    default:
      return text;
  }
}