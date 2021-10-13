const { generalist, builder, traveller } = require("../archetypes");

const spread = (gameState) => {
  const player = gameState.players[gameState.id];
  const unitArchetypes = {};

  player.units.forEach((unit) => {
    if(Number(unit.id.replace("u_", "")) < 2){
      unit.travelComplete = true;
      gameState.storage.units[unit.id] = unit;
    }
    if (player.researchPoints < 50) {
      unitArchetypes[unit.id] = player.units.length < 2 || gameState.storage.units[unit.id]?.travelComplete ? builder : traveller;
    } else {
      unitArchetypes[unit.id] = generalist;
    }
  });

  return unitArchetypes;
};

module.exports = { spread };