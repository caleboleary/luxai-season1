const { generalist } = require("../archetypes");

const fullGeneralist = (gameState) => {
  const player = gameState.players[gameState.id];
  const unitArchetypes = {};

  player.units.forEach((unit) => {
    unitArchetypes[unit.id] = generalist;
  });

  return unitArchetypes;
};

module.exports = { fullGeneralist };
