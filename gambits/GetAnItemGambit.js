const fs = require("fs");
const { GambitInterface } = require("./GambitInterface");

class GetAnItemGambit extends GambitInterface {
  constructor() {
    super("Who will be the first to get a item today?");
    // all possible animals to pick from
    this.items = JSON.parse(
      fs.readFileSync("./wager_entities_and_items.json")
    ).items;
    this.item = this.items[Math.floor(Math.random() * this.items.length)];
    this.title = `Who will be the first to acquire a ${this.item} today?`;

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
   * @param {String} causing_entity the entity that caused the death
   * @param {String} rec_item the item received
   */
  check_input(causing_entity, rec_item) {
    if (
      rec_item.toLowerCase().replace("_", " ") !== this.item &&
      !this.viable_predictions.has(causing_entity)
    )
      return false;

    this.winning_prediction = causing_entity;
    return true;
  }
}

module.exports = { GetAnItemGambit };
