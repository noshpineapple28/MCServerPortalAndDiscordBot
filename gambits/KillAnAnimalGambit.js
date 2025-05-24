const fs = require("fs");
const { GambitInterface } = require("./GambitInterface");

class KillAnAnimalGambit extends GambitInterface {
  constructor() {
    super("Who will be the first to kill an animal today?");
    // all possible animals to pick from
    this.animals = [
      "pig",
      "horse",
      "cow",
      "chicken",
      "zombie",
      "ender dragon",
      "enderman",
      "skeleton",
      "whither",
      "whither skeleton",
    ];
    let animal = this.animals[Math.floor(Math.random() * this.animals.length)];
    this.title = `Who will be the first to kill an ${animal} today? ANSWERS CASE SENSITIVE`;

    // read all whitelisted users to generate predictions
    const USERS = JSON.parse(fs.readFileSync("../whitelist.json"));
    for (const USER of USERS) {
      this.viable_predictions.add(USER.name);
    }
    this.viable_predictions.add("nobody");
    this.winning_prediction = "nobody";
  }

  /**
   * checks if a dead entity is related to the gambit, and if so what killed it
   * @param {String} entity_dead the entity that died
   * @param {String} causing_entity the entity that caused the death
   */
  check_input(entity_dead, causing_entity) {
    console.log(entity_dead, causing_entity);
    if (
      entity_dead !== this.animals &&
      !this.viable_predictions.has(causing_entity)
    )
      return false;

    this.winning_prediction = causing_entity;
    return true;
  }
}

module.exports = { KillAnAnimalGambit };
