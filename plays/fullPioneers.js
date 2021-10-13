const { generalist, pioneer } = require("../archetypes");
const { rushCoal } = require("./rushCoal");

const fullPioneers = (gameState) => {
  const player = gameState.players[gameState.id];
  let unitArchetypes = {};

  player.units.forEach((unit, index) => {
    if (index === 0) {
      unitArchetypes[unit.id] = generalist;
    } else {
      unitArchetypes[unit.id] = pioneer;
    }
  });

  return unitArchetypes;
};

module.exports = { fullPioneers };
