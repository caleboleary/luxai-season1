const {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getDoAnyCitiesNeedFuel,
  getCanUnitBuildCityRightNow,
  getUnitsTotalCargo,
} = require("../observations.js");

const {
  goToNearestMineableResource,
  goToNearestCityNeedingFuel,
  buildCity,
  moveToNearestEmptyTile,
  moveRandomDirection,
} = require("../actions.js");

//traveller = carries 1 night's worth of personal fuel (>4), looks for uninhabited resources, avoids cities on path to keep personal fuel
const traveller = (unit, gameState) => {
  unit.name = "traveller";
  const player = gameState.players[gameState.id];

  if (unit.isWorker() && unit.canAct()) {
    if (unit.getCargoSpaceLeft() > 0) {
      //gather at least a night's worth of resources
      goToNearestMineableResource(unit, gameState);
    } else {
      //look for uninhabited resources
      goToNearestMineableResource(unit, gameState, {spread:true});
      //check if unit has reached its destination
      if(unit.fixedTravelCell){
        const travelDestX = unit.fixedTravelCell.pos.x;
        const travelDestY = unit.fixedTravelCell.pos.y;
        unit.travelComplete = gameState.liveMap.map[travelDestY][travelDestX].playerUnits !== undefined;
      }
    }
  }
};

module.exports = {
  traveller,
};