const {
  getPositionHash,
  modelPosMoveByDirection,
  randomIntFromInterval,
} = require("./utils.js");
const {
  getClosestUnclaimedResourceTile,
  getNearestUnclaimedEmptyTile,
  getClosestUnclaimedCityTileNeedingFuel,
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
    logs.push(
      "heading to the closest city needing fuel" +
        JSON.stringify(closestCityTileNeedingFuel.pos)
    );
    actions.push(unit.move(dir));
    claimedTiles.push(getPositionHash(modelPosMoveByDirection(unit.pos, dir)));
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
