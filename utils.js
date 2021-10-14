const PF = require("pathfinding");

const getPositionHash = (pos) => `${pos.x}-${pos.y}`;

const modelPosMoveByDirection = (pos, direction) => {
  if (direction === "n") {
    return { x: pos.x, y: pos.y - 1 };
  }
  if (direction === "s") {
    return { x: pos.x, y: pos.y + 1 };
  }
  if (direction === "e") {
    return { x: pos.x + 1, y: pos.y };
  }
  if (direction === "w") {
    return { x: pos.x - 1, y: pos.y };
  }
  return pos;
};

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const transformMapIntoObstacleMatrixNotation = (
  gameState,
  doOwnCitiesBlock = true
) => {
  let matrix = [];

  for (let y = 0; y < gameState.liveMap.height; y++) {
    let row = [];
    for (let x = 0; x < gameState.liveMap.width; x++) {
      const cell = gameState.liveMap.map[y][x];

      const isCellBlocked =
        cell.citytile?.team === (gameState.id + 1) % 2 ||
        !!cell.playerUnits ||
        !!cell.opponentUnits ||
        (doOwnCitiesBlock && cell.citytile?.team === gameState.id);

      row.push(isCellBlocked ? 1 : 0);
    }
    matrix.push(row);
  }

  return matrix;
};

const initializeLiveMap = (gameState) => {
  const player = gameState.players[gameState.id];
  const opponent = gameState.players[(gameState.id + 1) % 2];

  //deep clone the map. This is slow, if we need speed later, take a hard look here.
  const mapCopy = JSON.parse(JSON.stringify(gameState.map));

  for (let i = 0; i < player.units.length; i++) {
    //track own units in live map
    const unit = player.units[i];
    const cell = mapCopy.map[unit.pos.y][unit.pos.x];

    cell.playerUnits = cell.playerUnits
      ? [...cell.playerUnits, { ...unit }]
      : [{ ...unit }];
  }

  for (let i = 0; i < opponent.units.length; i++) {
    //track enemy units in live map
    const unit = opponent.units[i];
    const cell = mapCopy.map[unit.pos.y][unit.pos.x];

    cell.opponentUnits = cell.opponentUnits
      ? [...cell.opponentUnits, { ...unit }]
      : [{ ...unit }];
  }

  return mapCopy;
};

const updateUnitPositionInLiveMap = (unit, gameState, newPosition) => {
  //add unit to list at new position
  const newCell = gameState.liveMap.map[newPosition.y][newPosition.x];
  newCell.playerUnits = newCell.playerUnits
    ? [...newCell.playerUnits, { ...unit }]
    : [{ ...unit }];

  //remove unit from list at prev position
  const oldCell = gameState.liveMap.map[unit.pos.y][unit.pos.x];
  if(oldCell.playerUnits){
    oldCell.playerUnits = oldCell.playerUnits.filter((u) => u.id !== unit.id);
    if (oldCell.playerUnits.length < 1) {
      oldCell.playerUnits = null;
    }
  }

  return;
};

const getNextStepTowardDestinationViaPathfinding = (
  unit,
  gameState,
  destination,
  canTraverseOwnCities = false
) => {
  const pathfindingGrid = new PF.Grid(
    transformMapIntoObstacleMatrixNotation(gameState, !canTraverseOwnCities)
  ); //make pathfinding grid
  pathfindingGrid.setWalkableAt(unit.pos.x, unit.pos.y, true); //set current tile walkable
  pathfindingGrid.setWalkableAt(destination.pos.x, destination.pos.y, true); //set destination walkable

  const pathFinder = new PF.AStarFinder();
  const path = pathFinder.findPath(
    unit.pos.x,
    unit.pos.y,
    destination.pos.x,
    destination.pos.y,
    pathfindingGrid
  );
  if (!path || !path.length) return null; //if no path, return (do nothing)
  return path[1]; //returning second item because first is current position.
};

const unitLog = (unit, gameState, message) => {
  gameState.logs.push(`turn:${gameState.turn} unit:${unit.id} - ${message}`);
};

const getSavedUnitProps = (savedUnitData, unit) => {
  if(savedUnitData){
    for(var prop in savedUnitData){
      if(!unit.hasOwnProperty(prop)){
        unit[prop] = savedUnitData[prop];
      }
    }
  }
};

module.exports = {
  getPositionHash,
  modelPosMoveByDirection,
  randomIntFromInterval,
  transformMapIntoObstacleMatrixNotation,
  initializeLiveMap,
  updateUnitPositionInLiveMap,
  getNextStepTowardDestinationViaPathfinding,
  unitLog,
  getSavedUnitProps,
};
