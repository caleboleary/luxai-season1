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

//generalist = collects resources, builds cities
const generalist = (unit, gameState) => {
  const player = gameState.players[gameState.id];

  if (getIsUnitCurrentlySharingTileWithOtherUnit(unit, gameState)) {
    moveRandomDirection(unit, gameState);
  } else if (unit.isWorker() && unit.canAct()) {
    if (unit.getCargoSpaceLeft() > 0) {
      // if the unit is a worker and we have space in cargo, lets find the nearest resource tile and try to mine it
      goToNearestMineableResource(unit, gameState);
    } else {
      // if unit is a worker and there is no cargo space left, and we have cities, lets return to them
      if (player.cities.size > 0) {
        if (getDoAnyCitiesNeedFuel(gameState)) {
          goToNearestCityNeedingFuel(unit, gameState);
        } else if (getCanUnitBuildCityRightNow(unit, gameState)) {
          buildCity(unit, gameState);
        } else {
          //move to nearest empty tile
          moveToNearestEmptyTile(unit, gameState);
        }
      } else {
        //if no cities, try to build one? Hopefully someone can!
        buildCity(unit, gameState);
      }
    }
  }
};

module.exports = {
  generalist,
};
