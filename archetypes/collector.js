const {
    getIsUnitCurrentlySharingTileWithOtherUnit,
    getDoAnyCitiesNeedFuel,
    getCanUnitBuildCityRightNow,
} = require("../observations.js");

const { getPositionHash } = require("../utils.js");

const {
    goToNearestMineableResource,
    goToNearestCityNeedingFuel,
    buildCity,
    moveToNearestEmptyTile,
    moveRandomDirection,
} = require("../actions.js");

//collector = only collects resources and delivers to cities
const collector = (unit, gameState) => {
    if (getIsUnitCurrentlySharingTileWithOtherUnit(unit, gameState)) {
        moveRandomDirection(unit, gameState);
    } else if (unit.isWorker() && unit.canAct()) {
        if (unit.getCargoSpaceLeft() > 0) {
            // if the unit is a worker and we have space in cargo, lets find the nearest resource tile and try to mine it
            goToNearestMineableResource(unit, gameState);
        } else {
            goToNearestCityNeedingFuel(unit, gameState);
        }
    }
}

module.exports = {
    collector
}