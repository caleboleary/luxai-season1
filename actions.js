const {
  randomIntFromInterval,
  modelPosMoveByDirection,
  updateUnitPositionInLiveMap,
  getNextStepTowardDestinationViaPathfinding,
  unitLog,
} = require("./utils.js");
const {
  getClosestUnclaimedResourceTile,
  getFurthestUnclaimedResourceTile,
  getNearestUnclaimedEmptyTile,
  getNearestUnclaimedEmptyTileOrthogonalToCity,
  getClosestUnclaimedCityTileNeedingFuel,
  getClosestCityTileWithLeastFuel,
  getAllEmptyTiles,
} = require("./observations.js");

const goToNearestMineableResource = (unit, gameState, args={}) => {
  let closestUnclaimedResourceTile = null;
  if(args.spread){
    //unit spreads to furthest resource from all other units
    closestUnclaimedResourceTile = getFurthestUnclaimedResourceTile(unit, gameState);
  }else{
    closestUnclaimedResourceTile = getClosestUnclaimedResourceTile(unit, gameState);
  }

  if (!closestUnclaimedResourceTile) {
    unitLog(unit, gameState, "no resources found, doing nothing.");
    return; //no resources, so I guess just do nothing
  }

  const nextStepPosition = getNextStepTowardDestinationViaPathfinding(
    unit,
    gameState,
    closestUnclaimedResourceTile,
    true //allow units to walk over own cities to get to resources
  );
  if (!nextStepPosition) return; //if no path, return (do nothing)

  const dir = unit.pos.directionTo(
    gameState.map.getCell(nextStepPosition[0], nextStepPosition[1]).pos
  );
  // move the unit in the direction towards the closest resource tile's position.
  gameState.actions.push(unit.move(dir));
  unitLog(
    unit,
    gameState,
    `moving direction ${dir} to pos [${nextStepPosition[0]},${nextStepPosition[1]}] to mine resources at [${closestUnclaimedResourceTile.pos.x},${closestUnclaimedResourceTile.pos.y}]`
  );

  //update the map to reflect this decided move
  const newPosition = modelPosMoveByDirection(unit.pos, dir);
  updateUnitPositionInLiveMap(unit, gameState, newPosition);
};

const goToNearestCityNeedingFuel = (unit, gameState) => {
  const closestCityTileNeedingFuel = getClosestUnclaimedCityTileNeedingFuel(
    unit,
    gameState
  );
  if (closestCityTileNeedingFuel != null) {
    const nextStepPosition = getNextStepTowardDestinationViaPathfinding(
      unit,
      gameState,
      closestCityTileNeedingFuel
    );
    if (!nextStepPosition) return; //if no path, return (do nothing)

    const dir = unit.pos.directionTo(
      gameState.map.getCell(nextStepPosition[0], nextStepPosition[1]).pos
    );

    gameState.actions.push(unit.move(dir));

    unitLog(
      unit,
      gameState,
      `heading to the closest city needing fuel, which is at  [${closestCityTileNeedingFuel.pos.x},${closestCityTileNeedingFuel.pos.y}] - moving ${dir} to  [${nextStepPosition[0]},${nextStepPosition[1]}]`
    );

    //update the map to reflect this decided move
    const newPosition = modelPosMoveByDirection(unit.pos, dir);
    updateUnitPositionInLiveMap(unit, gameState, newPosition);
  } else {
    //no cities needing fuel immediately, go to lowest fuel per tile then
    const cityTileWithLeastFuel = getClosestCityTileWithLeastFuel(
      unit,
      gameState
    );

    if (!cityTileWithLeastFuel) {
      unitLog(
        unit,
        gameState,
        "something went wrong, I found no cities needing fuel. Are there no cities at all? doing nothing."
      );

      return;
    }

    const nextStepPosition = getNextStepTowardDestinationViaPathfinding(
      unit,
      gameState,
      cityTileWithLeastFuel
    );
    if (!nextStepPosition) return; //if no path, return (do nothing)

    const dir = unit.pos.directionTo(
      gameState.map.getCell(nextStepPosition[0], nextStepPosition[1]).pos
    );

    unitLog(
      unit,
      gameState,
      `heading to the city with lowest relative fuel, which is at  [${cityTileWithLeastFuel.pos.x},${cityTileWithLeastFuel.pos.y}] - moving ${dir} to  [${nextStepPosition[0]},${nextStepPosition[1]}]`
    );
    gameState.actions.push(unit.move(dir));

    //update the map to reflect this decided move
    const newPosition = modelPosMoveByDirection(unit.pos, dir);
    updateUnitPositionInLiveMap(unit, gameState, newPosition);
  }
};

const buildCity = (unit, gameState) => {
  unitLog(
    unit,
    gameState,
    `building a city at my current position ([${unit.pos.x},${unit.pos.y}])`
  );
  gameState.actions.push(unit.buildCity());

  //TODO: do we need to model city build in liveMap? Since unit staying here, should already register as obstacle in pathing this turn
};

const moveToNearestEmptyTile = (unit, gameState) => {
  const nearestEmptyTile = getNearestUnclaimedEmptyTile(unit, gameState);
  if (nearestEmptyTile) {
    const nextStepPosition = getNextStepTowardDestinationViaPathfinding(
      unit,
      gameState,
      nearestEmptyTile
    );
    if (!nextStepPosition) return; //if no path, return (do nothing)

    const dir = unit.pos.directionTo(
      gameState.map.getCell(nextStepPosition[0], nextStepPosition[1]).pos
    );
    gameState.actions.push(unit.move(dir));
    unitLog(
      unit,
      gameState,
      `heading to nearest empty tile, which is at  [${nearestEmptyTile.pos.x},${nearestEmptyTile.pos.y}] - moving ${dir} to  [${nextStepPosition[0]},${nextStepPosition[1]}]`
    );

    //update the map to reflect this decided move
    const newPosition = modelPosMoveByDirection(unit.pos, dir);
    updateUnitPositionInLiveMap(unit, gameState, newPosition);
  } else {
    unitLog(
      unit,
      gameState,
      "BAD ERROR - no empty tiles at all?? doing nothing."
    );
  }
};

const moveToNearestEmptyTileOrthogonalToCity = (unit, gameState) => {
  const nearestEmptyTile = getNearestUnclaimedEmptyTileOrthogonalToCity(
    unit,
    gameState
  );
  if (nearestEmptyTile) {
    const nextStepPosition = getNextStepTowardDestinationViaPathfinding(
      unit,
      gameState,
      nearestEmptyTile
    );
    if (!nextStepPosition) return; //if no path, return (do nothing)

    const dir = unit.pos.directionTo(
      gameState.map.getCell(nextStepPosition[0], nextStepPosition[1]).pos
    );
    gameState.actions.push(unit.move(dir));
    unitLog(
      unit,
      gameState,
      `heading to nearest empty city-adjacent tile, which is at  [${nearestEmptyTile.pos.x},${nearestEmptyTile.pos.y}] - moving ${dir} to  [${nextStepPosition[0]},${nextStepPosition[1]}]`
    );

    //update the map to reflect this decided move
    const newPosition = modelPosMoveByDirection(unit.pos, dir);
    updateUnitPositionInLiveMap(unit, gameState, newPosition);
  } else {
    unitLog(
      unit,
      gameState,
      "BAD ERROR - no empty tiles orthogonal to cities all?? doing nothing."
    );
  }
};

const moveRandomDirection = (unit, gameState) => {
  //pick a random tile anywhere and make 1 step towards it - using this ensures random moves don't cause self colissions
  const emptyTiles = getAllEmptyTiles(gameState);
  const unClaimedEmptyTiles = emptyTiles.filter((eT) => {
    if (
      gameState.liveMap.map[eT.pos.y][eT.pos.x].playerUnits ||
      gameState.liveMap.map[eT.pos.y][eT.pos.x].opponentUnits
    ) {
      return false;
    }
    return true;
  });

  const randomEmptyTile =
    unClaimedEmptyTiles[
      randomIntFromInterval(0, unClaimedEmptyTiles.length - 1)
    ];

  const nextStepPosition = getNextStepTowardDestinationViaPathfinding(
    unit,
    gameState,
    randomEmptyTile
  );
  if (!nextStepPosition) return; //if no path, return (do nothing)

  const dir = unit.pos.directionTo(
    gameState.map.getCell(nextStepPosition[0], nextStepPosition[1]).pos
  );

  unitLog(
    unit,
    gameState,
    `moving random direction (${dir} to  [${nextStepPosition[0]},${nextStepPosition[1]}])`
  );

  gameState.actions.push(unit.move(dir));

  //update the map to reflect this decided move
  const newPosition = modelPosMoveByDirection(unit.pos, dir);
  updateUnitPositionInLiveMap(unit, gameState, newPosition);
};

module.exports = {
  goToNearestMineableResource,
  goToNearestCityNeedingFuel,
  buildCity,
  moveToNearestEmptyTile,
  moveToNearestEmptyTileOrthogonalToCity,
  moveRandomDirection,
};
