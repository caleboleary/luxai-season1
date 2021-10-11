const {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getDoAnyCitiesNeedFuel,
  getCanUnitBuildCityRightNow,
} = require("../observations.js");

const {
  goToNearestMineableResource,
  goToNearestCityNeedingFuel,
  buildCity,
  moveToNearestEmptyTile,
  moveRandomDirection,
} = require("../actions.js");

//builder = collects resources, builds cities, repeat
const builder = (unit, gameState) => {
  const player = gameState.players[gameState.id];

  if (getIsUnitCurrentlySharingTileWithOtherUnit(unit, gameState)) {
    moveRandomDirection(unit, gameState);
  } else if (unit.isWorker() && unit.canAct()) {
    if (unit.getCargoSpaceLeft() > 0) {
      // if the unit is a worker and we have space in cargo, lets find the nearest resource tile and try to mine it
      goToNearestMineableResource(unit, gameState);
    } else {
      // if unit is a worker and there is no cargo space left, build cities
      if (getCanUnitBuildCityRightNow(unit, gameState)) {
        buildCity(unit, gameState);
      } else {
        //move to nearest empty tile
        moveToNearestEmptyTile(unit, gameState);
      }
    }
  }
};

module.exports = {
  builder,
};