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
        gameState.liveMap.map[rT.pos.y][rT.pos.x].opponentUnits
      ) {
        return false;
      }
      return true;
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
      if (dist < closestDist) {
        closestDist = dist;
        closestResourceTile = cell;
      }
    });
  return closestResourceTile;
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
    (position.x + 1 < gameState.map.width &&
      gameState.map.getCell(position.x + 1, position.y)?.citytile?.team ===
        gameState.id) ||
    (position.x > 0 &&
      gameState.map.getCell(position.x - 1, position.y)?.citytile?.team ===
        gameState.id) ||
    (position.y + 1 < gameState.map.height &&
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

const getDoesCellHaveMineableResource = (gameState, cell) => {
  const player = gameState.players[gameState.id];

  if (
    cell.resource?.type === GAME_CONSTANTS.RESOURCE_TYPES.COAL &&
    player.researchPoints >= 50
  ) {
    return true;
  }
  if (
    cell.resource?.type === GAME_CONSTANTS.RESOURCE_TYPES.URANIUM &&
    player.researchPoints >= 200
  ) {
    return true;
  }
  if (cell.resource?.type === GAME_CONSTANTS.RESOURCE_TYPES.WOOD) {
    return true;
  }
  return false;
};

//depth first search modified from example at https://www.geeksforgeeks.org/find-number-of-islands/
const DFS = (row, col, visited, gameState, cluster) => {
  const width = gameState.map.width;
  const height = gameState.map.height;
  // These arrays are used to get row and column numbers
  // of 4 neighbors of a given cell
  let rowNbr = [1, -1, 0, 0];
  let colNbr = [0, 0, 1, -1];

  // Mark this cell as visited
  visited[row][col] = true;
  cluster.push({ x: col, y: row });

  // Recur for all connected neighbours
  for (let k = 0; k < 4; k++) {
    const newRow = row + rowNbr[k];
    const newCol = col + colNbr[k];
    if (
      newRow >= 0 &&
      newRow < height &&
      newCol >= 0 &&
      newCol < width &&
      getDoesCellHaveMineableResource(
        gameState,
        gameState.map.getCell(newCol, newRow)
      ) &&
      !visited[newRow][newCol]
    ) {
      DFS(newRow, newCol, visited, gameState, cluster);
    }
  }
};

const getAllResourceClusters = (gameState) => {
  const visitedArr = Array.from({ length: gameState.map.height }, (e) =>
    Array(gameState.map.width).fill(0)
  ); //visited tracker for DFS

  let clusters = [];
  for (let y = 0; y < gameState.map.height; y++) {
    for (let x = 0; x < gameState.map.width; x++) {
      if (
        getDoesCellHaveMineableResource(
          gameState,
          gameState.map.getCell(x, y)
        ) &&
        !visitedArr[y][x]
      ) {
        // value 1 is not
        // visited yet, then new cluster found, Visit all
        // cells in this cluster and add to list
        let cluster = [];
        DFS(y, x, visitedArr, gameState, cluster);
        clusters.push(cluster);
      }
    }
  }

  return clusters;
};

const getLargestResourceCluster = (gameState) => {
  const resourceClusters = getAllResourceClusters(gameState);

  let largestCluster = resourceClusters[0];

  for (let i = 1; i < resourceClusters.length; i++) {
    if (resourceClusters[i].length > largestCluster.length) {
      largestCluster = resourceClusters[i];
    }
  }

  return largestCluster;
};

const getLargestResourceClusterWithinRange = (unit, gameState) => {
  const turnsUntilNight = 30 - (gameState.turn % 40);
  const numberNightsCapableSurvive = Math.floor(
    (100 - unit.getCargoSpaceLeft()) / 10
  );
  const range =
    Math.floor(turnsUntilNight / 2) +
    Math.floor(numberNightsCapableSurvive / 2);

  const resourceClusters = getAllResourceClusters(gameState).filter(
    (cluster) => {
      const nearestCellInCluster = getNearestCellInResourceCluster(
        unit,
        gameState,
        cluster
      );

      const dist = nearestCellInCluster.pos.distanceTo(unit.pos);

      if (dist <= range) return true;
      return false;
    }
  );

  if (!resourceClusters?.length) return null;

  let largestCluster = resourceClusters[0];

  for (let i = 1; i < resourceClusters.length; i++) {
    if (resourceClusters[i].length > largestCluster.length) {
      largestCluster = resourceClusters[i];
    }
  }

  return largestCluster;
};

const getLargestNearestResourceCluster = (unit, gameState) => {
  const resourceClusters = getAllResourceClusters(gameState);

  let bestCluster = null;
  let bestClusterScore = 999999;

  for (let i = 1; i < resourceClusters.length; i++) {
    const nearestCellInCluster = getNearestCellInResourceCluster(
      unit,
      gameState,
      resourceClusters[i]
    );
    if (!nearestCellInCluster) continue;
    const dist = nearestCellInCluster.pos.distanceTo(unit.pos);
    if (resourceClusters[i].length / (dist / 1000) > bestClusterScore) {
      bestCluster = resourceClusters[i];
    }
  }

  return bestCluster;
};

const getNearestCellInResourceCluster = (unit, gameState, resourceCluster) => {
  let closestDist = 999999;
  let closestCell = null;

  resourceCluster?.forEach((resourceCell) => {
    const cell = gameState.map.getCell(resourceCell.x, resourceCell.y);
    const dist = cell.pos.distanceTo(unit.pos);
    if (dist < closestDist) {
      closestCell = cell;
      closestDist = dist;
    }
  });

  return closestCell;
};

module.exports = {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getClosestUnclaimedResourceTile,
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
  getAllResourceClusters,
  getLargestResourceCluster,
  getLargestNearestResourceCluster,
  getNearestCellInResourceCluster,
  getDoesCellHaveMineableResource,
  getLargestResourceClusterWithinRange,
};
