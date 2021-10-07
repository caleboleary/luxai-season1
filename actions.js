const {
  getPositionHash,
  modelPosMoveByDirection,
  randomIntFromInterval,
} = require("./utils.js");
const {
  getClosestUnclaimedResourceTile,
  getNearestUnclaimedEmptyTile,
  getClosestUnclaimedCityTileNeedingFuel,
  getClosestCityTileWithLeastFuel,
} = require("./observations.js");

const goToNearestMineableResource = (
  unit,
  actions,
  resourceTiles,
  player,
  claimedTiles,
  logs
) => {
  const closestUnclaimedResourceTile = getClosestUnclaimedResourceTile(
    resourceTiles,
    player,
    unit,
    claimedTiles
  );
  if (closestUnclaimedResourceTile != null) {
    const dir = unit.pos.directionTo(closestUnclaimedResourceTile.pos);
    // move the unit in the direction towards the closest resource tile's position.

    actions.push(unit.move(dir));
    claimedTiles.push(getPositionHash(modelPosMoveByDirection(unit.pos, dir)));
  }
};

const goToNearestCityNeedingFuel = (
  player,
  unit,
  claimedTiles,
  actions,
  logs
) => {
  const closestCityTileNeedingFuel = getClosestUnclaimedCityTileNeedingFuel(
    player,
    unit,
    claimedTiles
  );
  if (closestCityTileNeedingFuel != null) {
    const dir = unit.pos.directionTo(closestCityTileNeedingFuel.pos);

    if (
      claimedTiles.indexOf(
        getPositionHash(modelPosMoveByDirection(unit.pos, dir))
      ) > -1
    ) {
      moveRandomDirection(unit, actions, logs);
    } else {
      actions.push(unit.move(dir));
      claimedTiles.push(
        getPositionHash(modelPosMoveByDirection(unit.pos, dir))
      );
      logs.push(
        "heading to the closest city needing fuel" +
          JSON.stringify(closestCityTileNeedingFuel.pos)
      );
    }
  } else {
    //no cities needing fuel immediately, go to lowest fuel per tile then
    const cityTileWithLeastFuel = getClosestCityTileWithLeastFuel(
      player,
      unit,
      claimedTiles
    );

    if (!cityTileWithLeastFuel) {
      logs.push(
        "SOMETHING WENT WRONG, COULDNT FIND ANY CITY WHEN LOOKING FOR LEAST FUEL???"
      );
      return;
    }

    const dir = unit.pos.directionTo(cityTileWithLeastFuel.pos);
    if (
      claimedTiles.indexOf(
        getPositionHash(modelPosMoveByDirection(unit.pos, dir))
      ) > -1
    ) {
      moveRandomDirection(unit, actions, logs);
    } else {
      logs.push(
        "heading to the city with lowest fuel (though doesn't need it)" +
          JSON.stringify(cityTileWithLeastFuel.pos)
      );
      actions.push(unit.move(dir));
      claimedTiles.push(
        getPositionHash(modelPosMoveByDirection(unit.pos, dir))
      );
    }
  }
};

const buildCity = (unit, actions, logs) => {
  logs.push("TRIED TO BUILD CITY");
  actions.push(unit.buildCity());
};

const moveToNearestEmptyTile = (gameMap, unit, claimedTiles, actions, logs) => {
  const nearestEmptyTile = getNearestUnclaimedEmptyTile(
    gameMap,
    unit,
    claimedTiles
  );
  if (nearestEmptyTile) {
    logs.push("trying to move to" + JSON.stringify(nearestEmptyTile.pos));
    const dir = unit.pos.directionTo(nearestEmptyTile.pos);
    actions.push(unit.move(dir));
    claimedTiles.push(getPositionHash(modelPosMoveByDirection(unit.pos, dir)));
  } else {
    logs.push(
      "fell into the else, something went wrong or there are literally no empty tiles"
    );
  }
};

const DIRS = ["n", "s", "e", "w"];

const moveRandomDirection = (unit, actions, logs) => {
  logs.push(unit.id + " - moving random direction");
  actions.push(unit.move(DIRS[randomIntFromInterval(0, 3)]));
};

module.exports = {
  goToNearestMineableResource,
  goToNearestCityNeedingFuel,
  buildCity,
  moveToNearestEmptyTile,
  moveRandomDirection,
};
