const { generalist, builder } = require("../archetypes");

const rushCoal = (gameState) => {
  const player = gameState.players[gameState.id];
  const unitArchetypes = {};

  player.units.forEach((unit) => {
    if (player.researchPoints < 50) {
      unitArchetypes[unit.id] = builder;
    } else {
      unitArchetypes[unit.id] = generalist;
    }
  });

  return unitArchetypes;
};

module.exports = { rushCoal };
