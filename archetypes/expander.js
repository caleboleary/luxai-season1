//attempts to expand existing cities.
const {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getCanUnitBuildCityRightNow,
  getIsPositionOrthogonalToAnyCity,
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
    if (
      getCanUnitBuildCityRightNow(unit, gameState) &&
      getIsPositionOrthogonalToAnyCity(unit.pos, gameState)
    ) {
      buildCity(unit, gameState);
    } else {
      moveToNearestEmptyTileOrthogonalToCity(unit, gameState);
    }
  }
};

module.exports = {
  expander,
};
