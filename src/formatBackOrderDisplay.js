import { formatBackOrderContext } from './formatBackOrderContext.js';
import { formatBackOrderLines } from './formatBackOrderLines.js';
import { formatBackOrderSmart } from './formatBackOrderSmart.js';

export const formatBackOrderDisplay = (card, config) => {
  const style = config?.duplex?.backOrderStyle ?? 'wrap';
  const label = config?.duplex?.backLabel ?? 'Order';

  if (style === 'smart') {
    return formatBackOrderSmart(card, config);
  }

  if (style === 'context') {
    return {
      label: null,
      lines: [formatBackOrderContext(card, config)],
    };
  }

  if (style === 'single') {
    const orders = Array.isArray(card.orders) ? card.orders : [card.index];
    return {
      label: null,
      lines: [`${label}: ${orders.join(', ')}`],
    };
  }

  if (style === 'count') {
    const orders = Array.isArray(card.orders) ? card.orders : [card.index];
    return {
      label: null,
      lines: [`${label} Count: ${orders.length}`],
    };
  }

  return formatBackOrderLines(
    card,
    config,
    config?.duplex?.backMaxLineLength ?? 22
  );
};