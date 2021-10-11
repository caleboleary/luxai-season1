//attempts to expand existing cities.
const {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getCanUnitBuildCityRightNow,
} = require("../observations.js");

const {
  buildCity,
  moveToNearestEmptyTile,
  moveToNearestEmptyTileOrthogonalToCity,
  moveRandomDirection,
} = require("../actions.js");

//collector = only collects resources and delivers to cities
const expander = (unit, gameState) => {
  if (getIsUnitCurrentlySharingTileWithOtherUnit(unit, gameState)) {
    moveRandomDirection(unit, gameState);
  } else if (unit.isWorker() && unit.canAct()) {
    if (getCanUnitBuildCityRightNow(unit, gameState)) {
      buildCity(unit, gameState);
    } else {
      //move to nearest empty tile
      //   moveToNearestEmptyTile(unit, gameState);
      moveToNearestEmptyTileOrthogonalToCity(unit, gameState);
    }
  }
};

module.exports = {
  expander,
};
