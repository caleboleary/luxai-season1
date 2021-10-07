const GAME_CONSTANTS = require("./lux/game_constants");
const DIRECTIONS = GAME_CONSTANTS.DIRECTIONS;

const { getPositionHash } = require("./utils.js");

const getClosestUnclaimedResourceTile = (
  resourceTiles,
  player,
  unit,
  claimedTiles
) => {
  let closestResourceTile = null;
  let closestDist = 9999999;
  resourceTiles
    .filter((tile) => {
      return claimedTiles.indexOf(getPositionHash(tile.pos)) < 0;
    })
    .forEach((cell) => {
      if (
        cell.resource.type === GAME_CONSTANTS.RESOURCE_TYPES.COAL &&
        !player.researchedCoal()
      )
        return;
      if (
        cell.resource.type === GAME_CONSTANTS.RESOURCE_TYPES.URANIUM &&
        !player.researchedUranium()
      )
        return;
      const dist = cell.pos.distanceTo(unit.pos);
      if (
        dist < closestDist &&
        (cell.resource.type !== "wood" || cell.resource.amount > 50)
      ) {
        closestDist = dist;
        closestResourceTile = cell;
      }
    });
  return closestResourceTile;
};

const getNearestUnclaimedEmptyTile = (gameMap, unit, claimedTiles) => {
  const emptyTiles = getAllEmptyTiles(gameMap);

  let closestEmptyTile = null;
  let closestDist = 9999999;
  emptyTiles
    .filter((tile) => {
      return claimedTiles.indexOf(getPositionHash(tile.pos)) < 0;
    })
    .forEach((cell) => {
      const dist = cell.pos.distanceTo(unit.pos);
      if (dist < closestDist) {
        closestDist = dist;
        closestEmptyTile = cell;
      }
    });
  return closestEmptyTile;
};

const getClosestUnclaimedCityTileNeedingFuel = (player, unit, claimedTiles) => {
  const citiesArr = Object.values(Object.fromEntries(player.cities));

  let closestDist = 999999;
  let closestCityTile = null;

  citiesArr.forEach((city) => {
    if (city.lightUpkeep * 10 > city.fuel) {
      city.citytiles
        .filter((citytile) => {
          return claimedTiles.indexOf(getPositionHash(citytile.pos)) < 0;
        })
        .forEach((citytile) => {
          const dist = citytile.pos.distanceTo(unit.pos);
          if (dist < closestDist) {
            closestCityTile = citytile;
            closestDist = dist;
          }
        });
    }
  });

  return closestCityTile;
};

const getAllEmptyTiles = (gameMap) => {
  let emptyTiles = [];
  for (let y = 0; y < gameMap.height; y++) {
    for (let x = 0; x < gameMap.width; x++) {
      const cell = gameMap.getCell(x, y);
      if (!cell.citytile && !cell.resource) {
        // logs.push("empty tile?: " + JSON.stringify(cell));
        emptyTiles.push(cell);
      }
    }
  }

  return emptyTiles;
};

const getAllResourceTiles = (gameMap) => {
  let resourceTiles = [];
  for (let y = 0; y < gameMap.height; y++) {
    for (let x = 0; x < gameMap.width; x++) {
      const cell = gameMap.getCell(x, y);
      if (cell.hasResource()) {
        resourceTiles.push(cell);
      }
    }
  }

  return resourceTiles;
};

const getCountOwnedCityTiles = (cities) => {
  return cities.reduce((acc, currentCity) => {
    return acc + currentCity.citytiles.length;
  }, 0);
};

const getDoAnyCitiesNeedFuel = (player) => {
  const cities = Object.values(Object.fromEntries(player.cities));
  return cities.filter((city) => city.lightUpkeep * 10 > city.fuel).length > 0;
};

const getCanUnitBuildCityRightNow = (unit, gameMap) => {
  return (
    unit.canBuild(gameMap) && unit.canAct() && unit.getCargoSpaceLeft() < 1
  );
};

module.exports = {
  getClosestUnclaimedResourceTile,
  getNearestUnclaimedEmptyTile,
  getClosestUnclaimedCityTileNeedingFuel,
  getAllEmptyTiles,
  getAllResourceTiles,
  getCountOwnedCityTiles,
  getDoAnyCitiesNeedFuel,
  getCanUnitBuildCityRightNow,
};
