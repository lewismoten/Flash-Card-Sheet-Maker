export const formatBackOrderContext = (card, config) => {
  const label = config?.duplex?.backLabel ?? "Order";
  const orders = Array.isArray(card.orders) ? [...card.orders] : [card.index];
  const current = card.index;

  const currentPos = orders.indexOf(current);

  if (currentPos === -1) {
    return `${label}: ${orders.join(", ")}`;
  }

  const radius = Number(config?.duplex?.backContextRadius ?? 1);

  const start = Math.max(0, currentPos - radius);
  const end = Math.min(orders.length, currentPos + radius + 1);

  const visible = orders.slice(start, end).map((n) => (
    n === current ? `[${n}]` : String(n)
  ));

  if (start > 0) visible.unshift("...");
  if (end < orders.length) visible.push("...");

  return `${label}: ${visible.join(", ")}`;
};