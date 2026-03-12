import { formatBackOrderContext } from './formatBackOrderContext.js';
import { formatBackOrderLines } from './formatBackOrderLines.js';

export const formatBackOrderSmart = (card, config) => {
  const orders = Array.isArray(card.orders) ? card.orders : [card.index];
  const threshold = Number(config?.duplex?.backWrapThreshold ?? 8);

  if (orders.length > threshold) {
    return {
      label: null,
      lines: [formatBackOrderContext(card, config)]
    };
  }

  
  const o = formatBackOrderLines(
    card,
    config,
    config?.duplex?.backMaxLineLength ?? 22
  );
  if(o.lines.length > 2) {
    return {
      label: null,
      lines: [formatBackOrderContext(card, config)]
    };
  }
  return o;
};