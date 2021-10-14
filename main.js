const kit = require("./lux/kit");
const agent = new kit.Agent();
const fs = require("fs");

const {
  getCountOwnedCityTiles,
  getAllResourceClusters,
} = require("./observations");
const { initializeLiveMap } = require("./utils");

const { generalist, collector, expander, builder } = require("./archetypes");
const {
  fullGeneralist,
  rushCoal,
  rushUranium,
  rushCoalThenMaintainSmallLead,
  halfPioneers,
  fullPioneers,
  rushCoalWith1EarlyPioneer,
} = require("./plays");

const logs = [];

// first initialize the agent, and then proceed to go in a loop waiting for updates and running the AI
agent.initialize().then(async () => {
  while (true) {
    /** Do not edit! **/
    // wait for updates
    await agent.update();

    const actions = [];
    const gameState = agent.gameState;
    gameState.actions = actions;
    gameState.logs = logs;
    gameState.liveMap = initializeLiveMap(gameState); //clone of map that we updated with chosen moves
    /** AI Code Goes Below! **/

    const player = gameState.players[gameState.id];

    const unitArchetypes = rushCoalWith1EarlyPioneer(gameState);

    // we iterate over all our units and do something with them
    player.units.forEach((unit) => {
      unitArchetypes[unit.id](unit, gameState);
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
// informative logs
