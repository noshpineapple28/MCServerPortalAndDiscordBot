const { WanderingTrader } = require("./WanderingTrader");
const { sendEmbeds } = require("../helpers/embeds");

const TRADER = new WanderingTrader();

function summon_trader() {
  const embeds = [];
  TRADER.summon();
  TRADER.reroll_shop();
  embeds.push(TRADER.shop_embed_build());
  sendEmbeds(embeds);

  // set timeout for when he leaves
  let leave = new Date();
  leave.setHours(leave.getHours() + 1);
  let cur = new Date();
  setTimeout(desummon_trader, leave.getTime() - cur.getTime());
}

function desummon_trader() {
  const embeds = [];
  TRADER.desummon();
  embeds.push(TRADER.shop_leave_embed());
  sendEmbeds(embeds);

  // set timeout for when he arrives again
  let reappear = new Date();
  reappear.setHours(reappear.getHours() + Math.floor(Math.random() * 12) + 10);
  let cur = new Date();
  setTimeout(summon_trader, reappear.getTime() - cur.getTime());
}

function attempt_trade(discord_id, item_name) {
  let res = TRADER.attempt_trade(discord_id, item_name);
  // if the trade worked, tell everyone else that! otherwise, send the error ephemerally
  if (res[1]) {
    sendEmbeds(res.splice(0, 1));
    return true;
  }
  return res.splice(0, 1);
}

module.exports = { summon_trader, attempt_trade };
