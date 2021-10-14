const { generalist, builder, traveller } = require("../archetypes");

const spread = (gameState) => {
  const player = gameState.players[gameState.id];
  const unitArchetypes = {};

  player.units.forEach((unit) => {
    unitArchetypes[unit.id] = player.units.length < 2 || unit.travelComplete ? builder : traveller;
    if (player.researchPoints < 200) {
    } else {
      //unitArchetypes[unit.id] = generalist;
    }
  });

  return unitArchetypes;
};

module.exports = { spread };