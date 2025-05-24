const fs = require("fs");
const { GambitInterface } = require("./GambitInterface");

class KillAnEntityGambit extends GambitInterface {
  constructor() {
    super("Who will be the first to kill an animal today?");
    // all possible animals to pick from
    this.entities = JSON.parse(
      fs.readFileSync("./wager_entities_and_items.json")
    ).entities;
    this.entity =
      this.entities[Math.floor(Math.random() * this.entities.length)];
    this.title = `Who will be the first to kill a ${this.entity} today?`;

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
    if (
      entity_dead.toLowerCase().replace("_", " ") !== this.entity &&
      !this.viable_predictions.has(causing_entity)
    )
      return false;

    this.winning_prediction = causing_entity;
    return true;
  }
}

module.exports = { KillAnEntityGambit };
