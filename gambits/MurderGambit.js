const { GambitInterface } = require("./GambitInterface");

class MurderGambit extends GambitInterface {
  constructor() {
    super("Will someone be murdered today?");
    this.viable_predictions.add("yes");
    this.viable_predictions.add("no");
    this.winning_prediction = "no";
    this.case_sensitive = false;
  }

  check_wager(discord_user_id, token_amount, prediction) {
    return super.check_wager(
      discord_user_id,
      token_amount,
      prediction.toLowerCase()
    );
  }
}

module.exports = { MurderGambit };
