const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

class GambitInterface {
  constructor(gambit_title) {
    this.title = gambit_title;
    this.tokens_bet = {};
    // token for the timer counting to the end of the gambit
    this.timer_token = 0;
    // possible inputs
    this.viable_predictions = new Set();
    this.winning_prediction = undefined;
    this.image = "https://people.rit.edu/nam6711/gambit.png";
  }

  announcement_embed() {
    return new EmbedBuilder()
      .setColor(0xf12bac)
      .setTitle("New Gambit!")
      .setDescription(`\`${this.title}\``)
      .setAuthor({
        name: `Scratches' Gambits`,
        iconURL: this.image,
      });
  }

  end_gambit() {
    const users = JSON.parse(fs.readFileSync("./linked_users.json"));

    // produce some flavor text about results
    let text = `The result was \`${this.winning_prediction}\`! Here's the payouts for our correct wagers!\n`;
    for (let x in users) {
      let user = users[x];
      let tokens_won = 0;
      if (!this.tokens_bet[user.discord_user]) continue;
      for (let prediction in this.tokens_bet[user.discord_user]) {
        if (prediction === this.winning_prediction)
          tokens_won += this.tokens_bet[user.discord_user][prediction];
        else tokens_won -= this.tokens_bet[user.discord_user][prediction];
      }
      user.inventory.tokens += tokens_won;
      if (tokens_won > 0)
        text += `\`${x}\` was given a payout of \`${tokens_won}\` Token(s)\n`;
    }
    text +=
      "All other participants have had their pools deducted the appropriate amounts.";
    // if no one wagered, print that
    if (
      text ===
      "Here's the payouts!\nAll other participants have had their pools deducted the appropriate amounts."
    ) {
      text = "No winners today, No payouts!";
    }

    // save inventories
    fs.writeFileSync("./linked_users.json", JSON.stringify(users));

    // produce the embed
    return this.end_gambit_embed(text);
  }

  end_gambit_embed(text) {
    return new EmbedBuilder()
      .setColor(0xf12bac)
      .setTitle(`\`${this.title}\` gambit has ended!`)
      .setDescription(text)
      .setAuthor({
        name: `Scratches' Gambits`,
        iconURL: this.image,
      });
  }

  #create_error_embed(text) {
    return new EmbedBuilder()
      .setColor(0)
      .setTitle("Gambit Error")
      .setDescription(text)
      .setAuthor({
        name: `Scratches' Gambits`,
        iconURL: this.image,
      });
  }

  check_wager(discord_user_id, token_amount, prediction) {
    // read user prediction and see if it falls in line with possible options
    const embeds = [];
    if (!this.viable_predictions.size) {
      embeds.push(this.#create_error_embed("There is not currently a wager."));
      return embeds;
    }
    if (token_amount <= 0) {
      embeds.push(this.#create_error_embed("You must wager at least 1 token."));
      return embeds;
    }
    if (!this.viable_predictions.has(prediction)) {
      let text = "";
      for (let value of this.viable_predictions.values())
        text += `\`${value}\` `;
      embeds.push(
        this.#create_error_embed(
          `That is not a viable prediction for this wager.\n Potential options include: ${text} \nNOT CASE SENSITIVE`
        )
      );
      return embeds;
    }
    embeds.push(this.add_wager(discord_user_id, token_amount, prediction));
    return embeds;
  }

  add_wager(discord_user_id, amount, prediction) {
    // check if the user is linked yet
    const users = JSON.parse(fs.readFileSync("./linked_users.json"));
    let mc_user = undefined;
    for (const user in users)
      if (users[user].discord_user === discord_user_id) mc_user = users[user];
    // check if they're properly linked
    if (!mc_user)
      return this.#create_error_embed(
        "No existing whitelisted user is linked to your account"
      );
    if (mc_user.inventory.tokens < amount)
      return this.#create_error_embed(
        `Insufficient tokens. Requested ${amount}, own ${mc_user.inventory.tokens}`
      );

    // find how much theyve wagered and ensure they can afford this
    if (this.tokens_bet[mc_user.discord_user]) {
      let total_wagered = 0;
      for (let wager in this.tokens_bet[mc_user.discord_user])
        total_wagered += this.tokens_bet[mc_user.discord_user][wager];
      if (total_wagered + amount > mc_user.inventory.tokens)
        return this.#create_error_embed(
          `You've already pooled ${total_wagered} tokens. If you add ${amount} you would exceed how many you own, which is ${mc_user.inventory.tokens}.`
        );
    } else {
      this.tokens_bet[mc_user.discord_user] = {};
    }

    // save the waged tokens
    if (this.tokens_bet[mc_user.discord_user][prediction])
      this.tokens_bet[mc_user.discord_user][prediction] += amount;
    else this.tokens_bet[mc_user.discord_user][prediction] = amount;
    return new EmbedBuilder()
      .setColor(0xf12bac)
      .setTitle("Gambit Placed!")
      .setDescription(
        `${amount} tokens have been added to your pool! They won't be taken out of your account until the gambit ends.`
      )
      .setAuthor({
        name: `Scratches' Gambits`,
        iconURL: this.image,
      });
  }

  list_user_gambits(discord_user_id) {
    if (!this.tokens_bet[discord_user_id])
      return this.#create_error_embed("You have no gambits placed!");
    let text = "Here's your current bets:\n";
    for (let wager in this.tokens_bet[discord_user_id])
      text += `${wager} - \`${this.tokens_bet[discord_user_id][wager]} tokens\`\n`;
    text += "**Once a wager has been placed, it cannot be undone**";
    return new EmbedBuilder()
      .setColor(0xf12bac)
      .setTitle("Gambit List!")
      .setDescription(text)
      .setAuthor({
        name: `Scratches Gambits`,
        iconURL: this.image,
      });
  }

  get_gambit_options() {
    if (this.viable_predictions.size === 0)
      return [this.#create_error_embed("There is currently no ongoing Gambit")];
    let text = "Here are the viable options:\n";
    for (let value of this.viable_predictions.values()) text += `\`${value}\` `;
    embeds.push(
      new EmbedBuilder()
        .setColor(0xf12bac)
        .setTitle("Gambit List!")
        .setDescription(text)
        .setAuthor({
          name: `Scratches Gambits`,
          iconURL: this.image,
        })
    );
    return embeds;
  }
}

module.exports = { GambitInterface };
