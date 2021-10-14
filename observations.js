const GAME_CONSTANTS = require("./lux/game_constants");
const CONFIG = require("./CONFIG");

const getIsUnitCurrentlySharingTileWithOtherUnit = (unit, gameState) => {
  const player = gameState.players[gameState.id];
  const unitsOnTile =
    player.units.filter((u) => {
      return u.pos.x === unit.pos.x && u.pos.y === unit.pos.y;
    }).length || 0;
  return unitsOnTile > 1;
};

const getClosestUnclaimedResourceTile = (unit, gameState) => {
  const player = gameState.players[gameState.id];
  const resourceTiles = getAllResourceTiles(gameState);

  let closestResourceTile = null;
  let closestDist = 9999999;
  resourceTiles
    .filter((rT) => {
      if (
        gameState.liveMap.map[rT.pos.y][rT.pos.x].playerUnits ||
        gameState.liveMap.map[rT.pos.y][rT.pos.x].opponentUnits ||
        rT.resource.type === GAME_CONSTANTS.RESOURCE_TYPES.COAL && !player.researchedCoal() ||
        rT.resource.type === GAME_CONSTANTS.RESOURCE_TYPES.URANIUM && !player.researchedUranium()
      ) {
        return false;
      }
      return true;
    })
    .forEach((cell) => {
      const dist = cell.pos.distanceTo(unit.pos);
      if (dist < closestDist) {
        closestDist = dist;
        closestResourceTile = cell;
      }
    });
  return closestResourceTile;
};

//find furthest unclaimed resource for a spreading behavior
const getFurthestUnclaimedResourceTile = (unit, gameState) => {
  const player = gameState.players[gameState.id];
  let furthestUnclaimedResourceTile = unit.fixedTravelCell || null;
  if(furthestUnclaimedResourceTile) return furthestUnclaimedResourceTile;
  const resourceTiles = getAllResourceTiles(gameState);
  let furthestDist = 0;
  resourceTiles
    .filter((rT) => {
      if (
        gameState.liveMap.map[rT.pos.y][rT.pos.x].playerUnits ||
        gameState.liveMap.map[rT.pos.y][rT.pos.x].opponentUnits ||
        rT.resource.type === GAME_CONSTANTS.RESOURCE_TYPES.COAL && !player.researchedCoal() ||
        rT.resource.type === GAME_CONSTANTS.RESOURCE_TYPES.URANIUM && !player.researchedUranium()
      ) {
        return false;
      }
      return true;
    })
    .forEach((resourceCell) => {
      //find closest unit for each resource
      const allUnits = [
        ...gameState.players[gameState.id].units.map(u=>u.pos), //friendly units 
        ...gameState.players[(gameState.id + 1) % 2].units.map(u=>u.pos) //opponent units
      ];
      let closestDistToAnyUnit = 9999999;
      allUnits.forEach((allUnit)=>{
        const dist = resourceCell.pos.distanceTo(allUnit);
        if (dist < closestDistToAnyUnit) {
          closestDistToAnyUnit = dist;
        }
      })
      if (closestDistToAnyUnit > furthestDist) {
        furthestDist = closestDistToAnyUnit;
        furthestUnclaimedResourceTile = resourceCell;
      }
    });
  //this locks in a fixed travel cell, so unit won't keep looking for the furthest resource and will find a destination and stay with it until arrival
  unit.fixedTravelCell = furthestUnclaimedResourceTile;
  return furthestUnclaimedResourceTile;
};

const getNearestUnclaimedEmptyTile = (unit, gameState) => {
  const emptyTiles = getAllEmptyTiles(gameState);

  let closestEmptyTile = null;
  let closestDist = 9999999;
  emptyTiles
    .filter((eT) => {
      if (
        gameState.liveMap.map[eT.pos.y][eT.pos.x].playerUnits ||
        gameState.liveMap.map[eT.pos.y][eT.pos.x].opponentUnits
      ) {
        return false;
      }
      return true;
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

const getNearestUnclaimedEmptyTileOrthogonalToCity = (unit, gameState) => {
  const emptyTiles = getAllEmptyTiles(gameState);

  let closestEmptyTile = null;
  let closestDist = 9999999;
  emptyTiles
    .filter((eT) => {
      if (
        gameState.liveMap.map[eT.pos.y][eT.pos.x].playerUnits ||
        gameState.liveMap.map[eT.pos.y][eT.pos.x].opponentUnits
      ) {
        return false;
      }
      return true;
    })
    .filter((eT) => {
      if (getIsPositionOrthogonalToAnyCity(eT.pos, gameState)) {
        return true;
      }
      return false;
    })
    .forEach((cell) => {
      const dist = cell.pos.distanceTo(unit.pos);
      cell.dist = dist;
      if (dist < closestDist) {
        closestDist = dist;
        closestEmptyTile = cell;
      }
    });
  if (gameState.turn === 2) {
    gameState.logs.push(JSON.stringify(closestEmptyTile));
    gameState.logs.push(JSON.stringify(emptyTiles));
  }
  return closestEmptyTile;
};

const getClosestUnclaimedCityTileNeedingFuel = (unit, gameState) => {
  const player = gameState.players[gameState.id];

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

const getClosestCityTileWithLeastFuel = (unit, gameState) => {
  const player = gameState.players[gameState.id];

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

const getAllEmptyTiles = (gameState) => {
  let emptyTiles = [];
  for (let y = 0; y < gameState.map.height; y++) {
    for (let x = 0; x < gameState.map.width; x++) {
      const cell = gameState.map.getCell(x, y);
      if (!cell.citytile && !cell.resource) {
        emptyTiles.push(cell);
      }
    }
  }

  return emptyTiles;
};

const getAllResourceTiles = (gameState) => {
  let resourceTiles = [];
  for (let y = 0; y < gameState.map.height; y++) {
    for (let x = 0; x < gameState.map.width; x++) {
      const cell = gameState.map.getCell(x, y);
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

const getDoAnyCitiesNeedFuel = (gameState) => {
  const player = gameState.players[gameState.id];

  const cities = Object.values(Object.fromEntries(player.cities));
  return (
    cities.filter((city) => {
      if (gameState.turn > 320) return city.lightUpkeep * 10 > city.fuel; //if we're in the last day, we only need fuel enough for the last night, no extra
      return city.lightUpkeep * (10 * CONFIG.CITY_HUNGER_BUFFER) > city.fuel; //"need fuel" defined as enough for next night and half of following
    }).length > 0
  );
};

const getCanUnitBuildCityRightNow = (unit, gameState) => {
  return (
    unit.canBuild(gameState.map) &&
    unit.canAct() &&
    unit.getCargoSpaceLeft() < 1 &&
    !gameState.map.getCell(unit.pos.x, unit.pos.y).hasResource()
  );
};

const getMyCityTileCount = (gameState) => {
  const player = gameState.players[gameState.id];
  const citiesArr = Object.values(Object.fromEntries(player.cities));

  return getCountOwnedCityTiles(citiesArr);
};

const getOpponentCityTileCount = (gameState) => {
  const opponent = gameState.players[(gameState.id + 1) % 2];
  const citiesArr = Object.values(Object.fromEntries(opponent.cities));

  return getCountOwnedCityTiles(citiesArr);
};

const getIsPositionOrthogonalToAnyCity = (position, gameState) => {
  if (
    (position.x < gameState.map.width - 1 &&
      gameState.map.getCell(position.x + 1, position.y)?.citytile?.team ===
        gameState.id) ||
    (position.x > 0 &&
      gameState.map.getCell(position.x - 1, position.y)?.citytile?.team ===
        gameState.id) ||
    (position.y < gameState.map.height - 1 &&
      gameState.map.getCell(position.x, position.y + 1)?.citytile?.team ===
        gameState.id) ||
    (position.y > 0 &&
      gameState.map.getCell(position.x, position.y - 1)?.citytile?.team ===
        gameState.id)
  ) {
    return true;
  }
  return false;
};

const getUnitsTotalCargo = (unit) => {
  return Object.values(unit.cargo).reduce((a, b) => a + b);
};

module.exports = {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getClosestUnclaimedResourceTile,
  getFurthestUnclaimedResourceTile,
  getNearestUnclaimedEmptyTile,
  getNearestUnclaimedEmptyTileOrthogonalToCity,
  getClosestUnclaimedCityTileNeedingFuel,
  getClosestCityTileWithLeastFuel,
  getAllEmptyTiles,
  getAllResourceTiles,
  getCountOwnedCityTiles,
  getDoAnyCitiesNeedFuel,
  getCanUnitBuildCityRightNow,
  getMyCityTileCount,
  getOpponentCityTileCount,
  getIsPositionOrthogonalToAnyCity,
  getUnitsTotalCargo
};