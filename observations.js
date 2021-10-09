const GAME_CONSTANTS = require("./lux/game_constants");

const { getPositionHash } = require("./utils.js");

const getIsUnitCurrentlySharingTileWithOtherUnit = (unit, player) => {
  const unitsOnTile =
    player.units.filter((u) => {
      return u.pos.x === unit.pos.x && u.pos.y === unit.pos.y;
    }).length || 0;
  return unitsOnTile > 1;
};

const getClosestUnclaimedResourceTile = (resourceTiles, player, unit) => {
  let closestResourceTile = null;
  let closestDist = 9999999;
  resourceTiles.forEach((cell) => {
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

const getNearestUnclaimedEmptyTile = (gameMap, unit) => {
  const emptyTiles = getAllEmptyTiles(gameMap);

  let closestEmptyTile = null;
  let closestDist = 9999999;
  emptyTiles.forEach((cell) => {
    const dist = cell.pos.distanceTo(unit.pos);
    if (dist < closestDist) {
      closestDist = dist;
      closestEmptyTile = cell;
    }
  });
  return closestEmptyTile;
};

const getClosestUnclaimedCityTileNeedingFuel = (player, unit) => {
  const citiesArr = Object.values(Object.fromEntries(player.cities));

  let closestDist = 999999;
  let closestCityTile = null;

  citiesArr.forEach((city) => {
    if (city.lightUpkeep * 10 > city.fuel) {
      city.citytiles.forEach((citytile) => {
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

const getClosestCityTileWithLeastFuel = (player, unit) => {
  const citiesArr = Object.values(Object.fromEntries(player.cities));

  let closestDist = 999999;
  let leastFuel = 999999;
  let closestCityTile = null;

  citiesArr.forEach((city) => {
    if (city.fuel / city.citytiles.length < leastFuel) {
      city.citytiles.forEach((citytile) => {
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
  return cities.filter((city) => city.lightUpkeep * 15 > city.fuel).length > 0;
};

const getCanUnitBuildCityRightNow = (unit, gameMap) => {
  return (
    unit.canBuild(gameMap) && unit.canAct() && unit.getCargoSpaceLeft() < 1
  );
};

const getMyCityTileCount = (player) => {
  const citiesArr = Object.values(Object.fromEntries(player.cities));

  return getCountOwnedCityTiles(citiesArr);
};

const getOpponentCityTileCount = (opponent) => {
  const citiesArr = Object.values(Object.fromEntries(opponent.cities));

  return getCountOwnedCityTiles(citiesArr);
};

module.exports = {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getClosestUnclaimedResourceTile,
  getNearestUnclaimedEmptyTile,
  getClosestUnclaimedCityTileNeedingFuel,
  getClosestCityTileWithLeastFuel,
  getAllEmptyTiles,
  getAllResourceTiles,
  getCountOwnedCityTiles,
  getDoAnyCitiesNeedFuel,
  getCanUnitBuildCityRightNow,
  getMyCityTileCount,
  getOpponentCityTileCount,
};
