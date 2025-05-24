const { EmbedBuilder } = require("discord.js");
const { items_in_shop } = require("../config.json");
const fs = require("fs");

class WanderingTrader {
  constructor() {
    this.currently_selling = {};
    this.players_hugged = [];
    this.able_to_trade = false;
    this.image = "https://people.rit.edu/nam6711/kitch.png";
  }

  summon() {
    this.able_to_trade = true;
  }

  desummon() {
    this.able_to_trade = false;
  }

  reroll_shop() {
    // reroll
    const LOOT_TABLES = JSON.parse(
      fs.readFileSync("./wandering_trader_loot_table.json")
    );
    this.players_hugged = [];
    this.currently_selling = {};
    for (let i = 0; i < items_in_shop; i++) {
      let val = Math.random();
      // common loot
      let loot_pool = [];
      if (val >= 0.5) loot_pool = LOOT_TABLES["common"];
      else if (val >= 0.1) loot_pool = LOOT_TABLES["uncommon"];
      else if (val >= 0.02) loot_pool = LOOT_TABLES["rare"];
      else loot_pool = LOOT_TABLES["extremely_rare"];

      // grab item
      let item = loot_pool[Math.floor(Math.random() * loot_pool.length)];
      if (this.currently_selling[item.name]) {
        this.currently_selling[item.name].quantity *= 2;
        this.currently_selling[item.name].price = Math.floor(
          this.currently_selling[item.name].price * 1.5
        );
      } else {
        this.currently_selling[item.name] = {
          quantity: item.quantity,
          price: item.price,
          type: item.type,
        };
      }
    }
  }

  attempt_trade(discord_id, item_name) {
    const USERS = JSON.parse(fs.readFileSync("./linked_users.json"));
    let readable_item_name = item_name.replace("_", " ");
    let user = undefined;
    // check if trader is present
    if (!this.able_to_trade)
      return [
        this.trade_failure_embed(
          "A sign is stuck to the front of Kitch's shop\n*I've fled town, be back when the coast is clear*"
        ),
        false,
      ];
    // if item isnt in shop inven, exit
    if (!this.currently_selling[item_name] && readable_item_name !== "hug")
      return [
        this.trade_failure_embed(
          `Unfortunately, I'm not selling \`${readable_item_name}\` anymore. If my sign says I do, someone probably beat ya to the punch, kid.`
        ),
        false,
      ];
    // ensure user is linked
    for (let x in USERS)
      if (USERS[x].discord_user === discord_id) user = USERS[x];
    if (!user)
      return [
        this.trade_failure_embed(
          "You haven't linked a whitelisted account to your discord, use `link` first!"
        ),
        false,
      ];
    // see if they have the tokens for it
    if (
      readable_item_name !== "hug" &&
      user.inventory.tokens < this.currently_selling[item_name].price
    )
      return [
        this.trade_failure_embed(
          "You're broke kid, come back with more tokens"
        ),
        false,
      ];

    // add token command for hug
    if (readable_item_name === "hug") {
      let text =
        "I've only so much coin, I apologize. I hope my hugs are coin enough!";
      if (!this.players_hugged.includes(user.discord_user)) {
        text = "I've slipped some coin into ur inventory, carry on!";
        user.inventory.tokens.quantity += 1;
        this.players_hugged.push(user.discord_user);
        // save user inventories
        fs.writeFileSync("./linked_users.json", JSON.stringify(USERS));
      }
      return [this.trade_hug_embed(text), false];
    }

    // check if in user inven
    if (user.inventory[item_name])
      user.inventory[item_name].quantity +=
        this.currently_selling[item_name].quantity;
    else
      user.inventory[item_name] = {
        quantity: this.currently_selling[item_name].quantity,
        type: this.currently_selling[item_name].type,
      };
    // descriment their tokens
    user.inventory.tokens.quantity -= this.currently_selling[item_name].price;
    delete this.currently_selling[item_name];
    // save user inventories
    fs.writeFileSync("./linked_users.json", JSON.stringify(USERS));
    return [this.trade_success_embed(readable_item_name), true];
  }

  shop_embed_build() {
    let text = "**WARES**\n";
    text +=
      "`Hug` - Travelling alone is hard, so if you give me a hug I'll give you coin\n";
    for (let item in this.currently_selling) {
      text += `${this.currently_selling[item].quantity} \`${item.replace(
        "_",
        " "
      )}\` - \`${this.currently_selling[item].price}\` Tokens\n`;
    }
    return new EmbedBuilder()
      .setTitle("The Wandering Thief Arrives!")
      .setColor(0x915930)
      .setDescription(text)
      .setAuthor({
        name: `Kitch the Thief`,
        iconURL: this.image,
      });
  }

  shop_leave_embed() {
    return new EmbedBuilder()
      .setTitle("The Wandering Thief Departs!")
      .setColor(0x915930)
      .setDescription("Can't stay in one place too long!")
      .setAuthor({
        name: `Kitch the Thief`,
        iconURL: this.image,
      });
  }

  trade_success_embed(item) {
    return new EmbedBuilder()
      .setTitle("Trade Announcement")
      .setColor(0x915930)
      .setDescription(
        `The \`${item}\` has been sold, better luck next time to the rest of yas`
      )
      .setAuthor({
        name: `Kitch the Thief`,
        iconURL: this.image,
      });
  }

  trade_hug_embed(text) {
    return new EmbedBuilder()
      .setTitle("Trade Success!")
      .setColor(0x915930)
      .setDescription("Thank ya for the hug :] " + text)
      .setAuthor({
        name: `Kitch the Thief`,
        iconURL: this.image,
      });
  }

  trade_failure_embed(text) {
    return new EmbedBuilder()
      .setTitle("Trade Error")
      .setColor(0x4a3221)
      .setDescription(text)
      .setAuthor({
        name: `Kitch the Thief`,
        iconURL: this.image,
      });
  }
}

module.exports = { WanderingTrader };
