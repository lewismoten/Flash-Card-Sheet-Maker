export const formatBackOrderLines = (card, config, maxLineLength = 22) => {
  const label = config?.duplex?.backLabel ?? "Order";
  const orders = Array.isArray(card.orders) ? card.orders : [card.index];
  const parts = orders.map(String);

  const lines = [];
  let currentLine = "";

  for (const part of parts) {
    const next = currentLine ? `${currentLine}, ${part}` : part;

    if (next.length <= maxLineLength) {
      currentLine = next;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = part;
    }
  }

  if (currentLine) lines.push(currentLine);

  return {
    label,
    lines
  };
};