//keep easily tweakable configurations here. In future, might write ML or genetic algo to try lots of configs in tournaments against each other

const CONFIG = {
  //10 food per tile * this is how much a city needs to be considered "not hungry"
  //for example, 1.5 would mean each city tile wants 15 fuel even though only burns 10 over night.
  //higher numbers cause slower expansion but more resilience.
  CITY_HUNGER_BUFFER: 1,
};

module.exports = CONFIG;
