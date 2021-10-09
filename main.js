const kit = require("./lux/kit");
const agent = new kit.Agent();
const fs = require("fs");

const {
  getIsUnitCurrentlySharingTileWithOtherUnit,
  getAllResourceTiles,
  getCountOwnedCityTiles,
  getDoAnyCitiesNeedFuel,
  getCanUnitBuildCityRightNow,
  getMyCityTileCount,
  getOpponentCityTileCount,
} = require("./observations.js");

const { getPositionHash } = require("./utils.js");

const {
  goToNearestMineableResource,
  goToNearestCityNeedingFuel,
  buildCity,
  moveToNearestEmptyTile,
  moveRandomDirection,
} = require("./actions.js");

const logs = [];

// first initialize the agent, and then proceed to go in a loop waiting for updates and running the AI
agent.initialize().then(async () => {
  while (true) {
    /** Do not edit! **/
    // wait for updates
    await agent.update();

    const actions = [];
    const gameState = agent.gameState;
    /** AI Code Goes Below! **/

    const player = gameState.players[gameState.id];
    const opponent = gameState.players[(gameState.id + 1) % 2];
    const gameMap = gameState.map;

    const resourceTiles = getAllResourceTiles(gameMap);

    // we iterate over all our units and do something with them
    player.units.forEach((unit) => {
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
    });

    const citiesArr = Object.values(Object.fromEntries(player.cities));
    let unitCount = player.units.length;
    //loop cities and do stuff with them too!
    citiesArr.forEach((city) => {
      city.citytiles.forEach((cityTile) => {
        if (
          unitCount < getCountOwnedCityTiles(citiesArr) &&
          cityTile.canAct()
        ) {
          actions.push(cityTile.buildWorker());
          unitCount++;
        } else if (cityTile.canAct() && player.researchPoints < 200) {
          actions.push(cityTile.research());
        }
      });
    });

    // you can add debug annotations using the functions in the annotate object
    // actions.push(annotate.circle(0, 0))
    fs.writeFileSync("logs.txt", logs.join("\r\n"), () => {
      console.log("wrote logs");
    });

    /** AI Code Goes Above! **/

    /** Do not edit! **/
    console.log(actions.join(","));
    // end turn
    agent.endTurn();
  }
});

//TODO:
// don't kill trees
// prioritize expansion in morning, fueling in evening?
// should units stay inside overnight?
// shhould we try to expand cities rather than spring them up anywhere?
// a* pathing? - simulate board state if the moves are applied. kind of what we're doing with the claimedtiles but... better.
