const { randomIntFromInterval } = require("./utils.js");
const {
  getClosestUnclaimedResourceTile,
  getNearestUnclaimedEmptyTile,
  getClosestUnclaimedCityTileNeedingFuel,
  getClosestCityTileWithLeastFuel,
} = require("./observations.js");

const goToNearestMineableResource = (unit, gameState) => {
  const closestUnclaimedResourceTile = getClosestUnclaimedResourceTile(
    unit,
    gameState
  );
  if (closestUnclaimedResourceTile != null) {
    const dir = unit.pos.directionTo(closestUnclaimedResourceTile.pos);
    // move the unit in the direction towards the closest resource tile's position.

    gameState.actions.push(unit.move(dir));
  }
};

const goToNearestCityNeedingFuel = (unit, gameState) => {
  const closestCityTileNeedingFuel = getClosestUnclaimedCityTileNeedingFuel(
    unit,
    gameState
  );
  if (closestCityTileNeedingFuel != null) {
    const dir = unit.pos.directionTo(closestCityTileNeedingFuel.pos);

    gameState.actions.push(unit.move(dir));

    gameState.logs.push(
      "heading to the closest city needing fuel" +
        JSON.stringify(closestCityTileNeedingFuel.pos)
    );
  } else {
    //no cities needing fuel immediately, go to lowest fuel per tile then
    const cityTileWithLeastFuel = getClosestCityTileWithLeastFuel(
      unit,
      gameState
    );

    if (!cityTileWithLeastFuel) {
      gameState.logs.push(
        "SOMETHING WENT WRONG, COULDNT FIND ANY CITY WHEN LOOKING FOR LEAST FUEL???"
      );
      return;
    }

    const dir = unit.pos.directionTo(cityTileWithLeastFuel.pos);

    gameState.logs.push(
      "heading to the city with lowest fuel (though doesn't need it)" +
        JSON.stringify(cityTileWithLeastFuel.pos)
    );
    gameState.actions.push(unit.move(dir));
  }
};

const buildCity = (unit, gameState) => {
  gameState.logs.push("TRIED TO BUILD CITY");
  gameState.actions.push(unit.buildCity());
};

const moveToNearestEmptyTile = (unit, gameState) => {
  const nearestEmptyTile = getNearestUnclaimedEmptyTile(unit, gameState);
  if (nearestEmptyTile) {
    gameState.logs.push(
      "trying to move to" +
        JSON.stringify(nearestEmptyTile.pos) +
        "-from" +
        JSON.stringify(unit.pos)
    );
    const dir = unit.pos.directionTo(nearestEmptyTile.pos);
    gameState.logs.push("dir is " + dir);
    gameState.actions.push(unit.move(dir));
  } else {
    gameState.logs.push(
      "fell into the else, something went wrong or there are literally no empty tiles"
    );
  }
};

const DIRS = ["n", "s", "e", "w"];

const moveRandomDirection = (unit, gameState) => {
  gameState.logs.push(unit.id + " - moving random direction");
  gameState.actions.push(unit.move(DIRS[randomIntFromInterval(0, 3)]));
};

module.exports = {
  goToNearestMineableResource,
  goToNearestCityNeedingFuel,
  buildCity,
  moveToNearestEmptyTile,
  moveRandomDirection,
};
