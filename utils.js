const getPositionHash = (pos) => `${pos.x}-${pos.y}`;

const modelPosMoveByDirection = (pos, direction) => {
  if (direction === "n") {
    return { x: pos.x, y: pos.y - 1 };
  }
  if (direction === "s") {
    return { x: pos.x, y: pos.y + 1 };
  }
  if (direction === "e") {
    return { x: pos.x + 1, y: pos.y };
  }
  if (direction === "w") {
    return { x: pos.x - 1, y: pos.y };
  }
  return pos;
};

module.exports = { getPositionHash, modelPosMoveByDirection };
