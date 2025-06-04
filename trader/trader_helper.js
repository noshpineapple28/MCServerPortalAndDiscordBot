const { WanderingTrader } = require("./WanderingTrader");
const { sendEmbeds } = require("../helpers/embeds");

const TRADER = new WanderingTrader();

async function summon_trader() {
  const embeds = [];
  TRADER.summon();
  TRADER.reroll_shop();
  embeds.push(TRADER.shop_embed_build());
  TRADER.ware_embeds = await sendEmbeds(embeds);

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
  reappear.setHours(wait.getHours() + Math.floor(Math.random() * 24));
  reappear.setMinutes(wait.getMinutes() + Math.floor(Math.random() * 60));
  let cur = new Date();
  setTimeout(summon_trader, reappear.getTime() - cur.getTime());
}

function attempt_trade(discord_id, item_name) {
  let res = TRADER.attempt_trade(discord_id, item_name);
  return res;
}

module.exports = { summon_trader, attempt_trade };
