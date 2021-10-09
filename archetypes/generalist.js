const {
    getIsUnitCurrentlySharingTileWithOtherUnit,
    getAllResourceTiles,
    getCountOwnedCityTiles,
    getDoAnyCitiesNeedFuel,
    getCanUnitBuildCityRightNow,
    getMyCityTileCount,
    getOpponentCityTileCount,
} = require("../observations.js");

const { getPositionHash } = require("../utils.js");

const {
    goToNearestMineableResource,
    goToNearestCityNeedingFuel,
    buildCity,
    moveToNearestEmptyTile,
    moveRandomDirection,
} = require("../actions.js");

//generalist = collects resources, builds cities
const generalist = (unit) => {
    if (getIsUnitCurrentlySharingTileWithOtherUnit(unit, player)) {
        moveRandomDirection(unit, actions, logs);
    } else if (unit.isWorker() && unit.canAct()) {
        if (unit.getCargoSpaceLeft() > 0) {
            // if the unit is a worker and we have space in cargo, lets find the nearest resource tile and try to mine it
            goToNearestMineableResource(
                unit,
                actions,
                resourceTiles,
                player,
                logs
            );
        } else {
            // if unit is a worker and there is no cargo space left, and we have cities, lets return to them
            if (player.cities.size > 0) {
                if (getDoAnyCitiesNeedFuel(player)) {
                    goToNearestCityNeedingFuel(player, unit, actions, logs);
                } else if (getCanUnitBuildCityRightNow(unit, gameMap)) {
                    buildCity(unit, actions, logs);
                } else {
                    //move to nearest empty tile
                    moveToNearestEmptyTile(gameMap, unit, actions, logs);
                }
            } else {
                //if no cities, try to build one? Hopefully someone can!
                buildCity(unit, actions, logs);
            }
        }
    }
}

module.exports = {
    generalist
}