import { normalizeCardKey } from './normalizeCardKey.js';

export const assignCardOrders = (cards, { normalize = true } = {}) => {
  const keyMap = new Map();

  for (const card of cards) {
    const key = normalize ? normalizeCardKey(card.text) : card.text;

    if (!keyMap.has(key)) {
      keyMap.set(key, []);
    }

    keyMap.get(key).push(card.index);
  }

  return cards.map((card) => {
    const key = normalize ? normalizeCardKey(card.text) : card.text;
    return {
      ...card,
      orders: keyMap.get(key) ?? [card.index],
    };
  });
}