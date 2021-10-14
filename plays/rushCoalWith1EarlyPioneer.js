const { builder, pioneer } = require("../archetypes");
const { halfPioneers } = require("./halfPioneers");

const rushCoalWith1EarlyPioneer = (gameState) => {
  const player = gameState.players[gameState.id];
  let unitArchetypes = {};

  player.units.forEach((unit, index) => {
    if (player.researchPoints < 50) {
      if (index === 1) {
        unitArchetypes[unit.id] = pioneer;
      } else {
        unitArchetypes[unit.id] = builder;
      }
    } else {
      unitArchetypes = halfPioneers(gameState);
    }
  });

  return unitArchetypes;
};

module.exports = { rushCoalWith1EarlyPioneer };
