export const getBackSlotIndex = (slotIndex, cols, rows, duplexConfig = {}) => {
  const {
    mirrorForFlipLongEdge = true,
    mirrorForFlipShortEdge = false,
  } = duplexConfig;

  const row = Math.floor(slotIndex / cols);
  const col = slotIndex % cols;

  let newRow = row;
  let newCol = col;

  if (mirrorForFlipLongEdge) {
    newCol = cols - 1 - col;
  }

  if (mirrorForFlipShortEdge) {
    newRow = rows - 1 - row;
  }

  return newRow * cols + newCol;
}