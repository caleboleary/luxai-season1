const { generalist, builder } = require("../archetypes");

const rushUranium = (gameState) => {
  const player = gameState.players[gameState.id];
  const unitArchetypes = {};

  player.units.forEach((unit) => {
    if (player.researchPoints < 200) {
      unitArchetypes[unit.id] = builder;
    } else {
      unitArchetypes[unit.id] = generalist;
    }
  });

  return unitArchetypes;
};

module.exports = { rushUranium };
