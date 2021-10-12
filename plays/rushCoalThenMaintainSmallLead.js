const { generalist, builder, collector, expander } = require("../archetypes");
const {
  getMyCityTileCount,
  getOpponentCityTileCount,
} = require("../observations");

const DESIRED_LEAD = 5;

const rushCoalThenMaintainSmallLead = (gameState) => {
  const player = gameState.players[gameState.id];
  const unitArchetypes = {};

  player.units.forEach((unit) => {
    if (player.researchPoints < 50) {
      unitArchetypes[unit.id] = builder;
    } else {
      if (
        unit.getCargoSpaceLeft() > 0 ||
        gameState.turn % 40 > 25 ||
        getMyCityTileCount(gameState) <
          getOpponentCityTileCount(gameState) + DESIRED_LEAD
      ) {
        unitArchetypes[unit.id] = collector;
      } else {
        unitArchetypes[unit.id] = expander;
      }
    }
  });

  return unitArchetypes;
};

module.exports = { rushCoalThenMaintainSmallLead };
