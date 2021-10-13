const { generalist, pioneer } = require("../archetypes");
const { rushCoal } = require("./rushCoal");

const halfPioneers = (gameState) => {
  const player = gameState.players[gameState.id];
  let unitArchetypes = {};

  player.units.forEach((unit, index) => {
    if (player.researchPoints < 50) {
      gameState.logs.push("test???");
      unitArchetypes = rushCoal(gameState);
    } else {
      if (index === 0 || index % 2 === 0) {
        unitArchetypes[unit.id] = generalist;
      } else {
        unitArchetypes[unit.id] = pioneer;
      }
    }
  });

  return unitArchetypes;
};

module.exports = { halfPioneers };
