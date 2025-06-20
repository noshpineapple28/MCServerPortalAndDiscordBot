const { GambitInterface } = require("./GambitInterface");
const { SomeoneDiesGambit } = require("./SomeoneDiesGambit");
const { sendEmbeds } = require("../helpers/embeds");
const { MurderGambit } = require("./MurderGambit");
const { KillAnEntityGambit } = require("./KillAnEntityGambit");
const { GetAnItemGambit } = require("./GetAnItemGambit");

let current_gambit = new GambitInterface("No Gambit Ongoing");
const POSSIBLE_GAMBITS = [
  KillAnEntityGambit,
  GetAnItemGambit,
  MurderGambit,
  SomeoneDiesGambit,
];

function add_viable_option(gambit_type, option) {
  if (gambit_type.constructor !== current_gambit.constructor) return;
  current_gambit.viable_predictions.add(option);
}

function get_wager_options() {
  return current_gambit.get_gambit_options();
}

function process_wager(discord_user_id, tokens, prediction) {
  return current_gambit.check_wager(discord_user_id, tokens, prediction);
}

function process_wager_listing(discord_user_id) {
  return [current_gambit.list_user_gambits(discord_user_id)];
}

function change_gambit_win_condition(
  gambit_to_check_for,
  new_condition,
  end_early = false
) {
  if (current_gambit.constructor !== gambit_to_check_for.constructor) return;
  current_gambit.winning_prediction = new_condition;
  if (end_early) end_gambit();
}

/**
 * this will take input from server events and process them to see if a gambit should end
 * @param {GambitInterface} gambit_type the type of gambit we are looking to process
 * @param  {...any} inputs
 */
function process_gambit_input(gambit_type, ...inputs) {
  if (gambit_type.constructor !== current_gambit.constructor) return;

  if (current_gambit.check_input(inputs[0].trim(), inputs[1].trim()))
    end_gambit();
}

function end_gambit() {
  // save embeds returned from gambit
  let embeds = [];
  clearTimeout(current_gambit.timer_token);
  embeds.push(current_gambit.end_gambit());
  sendEmbeds(embeds);
  current_gambit = new GambitInterface("No Gambit Ongoing");

  // wait for 6 hours
  let six_am = new Date();
  six_am.setHours(six_am.getHours() + Math.ceil(Math.random() * 12));
  six_am.setMinutes(six_am.getMinutes() + Math.ceil(Math.random() * 60));
  let time = new Date();
  setTimeout(create_gambit, six_am.getTime() - time.getTime());
}

function create_gambit() {
  // pick a new gambit
  let index = Math.floor(Math.random() * POSSIBLE_GAMBITS.length);
  if (index >= POSSIBLE_GAMBITS.length)
    console.error("ERROR INDEX OUT OF RANGE");
  current_gambit = new POSSIBLE_GAMBITS[index]();
  let embeds = [];
  embeds.push(current_gambit.announcement_embed());
  sendEmbeds(embeds);

  // wait till end of day
  let end_time = new Date();
  end_time.setHours(end_time.getHours() + 12);
  let time = new Date();
  current_gambit.timer_token = setTimeout(
    end_gambit,
    end_time.getTime() - time.getTime()
  );
}

module.exports = {
  create_gambit,
  process_wager,
  process_wager_listing,
  change_gambit_win_condition,
  get_wager_options,
  add_viable_option,
  process_gambit_input,
};
