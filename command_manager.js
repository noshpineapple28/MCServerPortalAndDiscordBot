const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { process_wager, process_wager_listing, get_wager_options } = require("./gambits/gambit");
const { attempt_trade } = require("./trader/trader_helper");
const {
  summonEntity,
  giveItem,
  check_if_online,
} = require("./mcserver_manager");
// the status of the server
let SERVER;

function initializeCommands(servers) {
  // copy servers over
  SERVER = servers;
}

// server status colors
const STATUS_COLORS = {
  on: 0x5bcc5b,
  off: 0xffffff,
  idle: 0xd3d3d3,
  turning_off: 0xd3d3d3,
  message: 0x31a4d4,
};

function createServerStatusChangeErrorEmbed(error) {
  console.log("Server state change error command sent");

  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(0)
      .setTitle(`${SERVER.name} Server Status`)
      .setDescription(`${error}`)
      .setAuthor({
        name: `${SERVER.name} Server Manager`,
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerShutDownEmbed() {
  console.log("Server shut down command sent");
  if (SERVER.status !== "on") {
    return false;
  }

  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["off"])
      .setTitle(`${SERVER.name} Server Status`)
      .setDescription(`The server is shutting down!`)
      .setAuthor({
        name: `${SERVER.name} Server Manager`,
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerStartUpEmbed() {
  console.log("Server start up command sent");
  if (SERVER.status !== "off") {
    return false;
  }

  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["on"])
      .setTitle(`${SERVER.name} Server Status`)
      .setDescription(`The server is starting up!`)
      .setAuthor({
        name: `${SERVER.name} Server Manager`,
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerStatusEmbed() {
  console.log("Server status command sent");
  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS[SERVER.status])
      .setTitle(`${SERVER.name} Server Status`)
      .setDescription(`The server is ${SERVER.status}`)
      .setAuthor({
        name: `${SERVER.name} Server Manager`,
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerWhitelistEmbed(username) {
  console.log("Server status command sent");
  const embeds = [];
  if (SERVER.status !== "on") {
    return false;
  }

  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["idle"])
      .setTitle(`${SERVER.name} Server Status`)
      .setDescription(`${username} has been whitelisted to the server`)
      .setAuthor({
        name: `${SERVER.name} Server Manager`,
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerLinkEmbed(username, discord_user, discord_user_id) {
  console.log("Server status command sent");
  const embeds = [];

  // check to see if that user exists
  let user_exists = false;
  WHITELISTED_USERS = JSON.parse(fs.readFileSync("../whitelist.json"));
  WHITELISTED_USERS.forEach((user) => {
    if (username === user.name) user_exists = true;
  });
  if (!user_exists) {
    return false;
  }

  // link discord user to minecraft user
  const LINKED_USERS = JSON.parse(fs.readFileSync("./linked_users.json"));
  if (LINKED_USERS[username])
    LINKED_USERS[username].discord_user = discord_user_id;
  else
    LINKED_USERS[username] = {
      discord_user: discord_user_id,
      inventory: {
        tokens: { quantity: 10 },
      },
    };
  // save the json file
  fs.writeFileSync(
    "./linked_users.json",
    JSON.stringify(LINKED_USERS),
    (err) => {
      if (err) return console.log(err);
      console.log(JSON.stringify(file));
      console.log("writing to " + fileName);
    }
  );

  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["idle"])
      .setTitle(`${SERVER.name} Server Status`)
      .setDescription(`${username} has been linked to ${discord_user}`)
      .setAuthor({
        name: `${SERVER.name} Server Manager`,
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function buildListEmbed(total, players) {
  console.log("Server status command sent");
  const embeds = [];
  if (SERVER.status !== "on") {
    return false;
  }

  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["idle"])
      .setTitle(total)
      .setDescription(players)
      .setAuthor({
        name: `${SERVER.name} Server Manager`,
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerMessageEmbed(format) {
  console.log("Server message command sent");
  if (SERVER.status !== "on") return false;

  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(0x31a4d4)
      .setTitle(`${SERVER.name} IMS`)
      .setDescription(`A ${format} message was sent!`)
      .setAuthor({
        name: `${SERVER.name} IMS`,
        iconURL: "https://people.rit.edu/nam6711/icon.png",
      })
  );
  return embeds;
}

function createServerGambitEmbed(discord_user_id, tokens, prediction) {
  console.log("Server gambit wager command sent");

  const embeds = process_wager(discord_user_id, tokens, prediction);
  return embeds;
}

function createServerGambitOptionsEmbed() {
  console.log("Server gambit wager options command sent");

  const embeds = get_wager_options();
  return embeds;
}

function createServerGambitListWagersEmbed(discord_user_id) {
  console.log("Server gambit list wagers command sent");

  const embeds = process_wager_listing(discord_user_id);
  return embeds;
}

function createServerInventoryEmbed(discord_user_id, username) {
  console.log("Server list inventory command sent");
  let user = undefined;
  let users = JSON.parse(fs.readFileSync("./linked_users.json"));
  for (let x in users)
    if (users[x].discord_user === discord_user_id) user = users[x];
  // if unlinked, exit
  if (!user) return false;

  text = "Here's your items!\n";
  for (let item in user.inventory) {
    text += `\`${item}\` - ${user.inventory[item].quantity}\n`;
  }
  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["idle"])
      .setTitle(`${username}'s Inventory!`)
      .setDescription(text)
      .setAuthor({
        name: `${SERVER.name} Inventory Manager`,
        iconURL: "https://people.rit.edu/nam6711/icon.png",
      })
  );
  return embeds;
}

function createServerTradeEmbed(discord_user_id, item_name) {
  console.log("Server trade command sent");

  const embeds = attempt_trade(discord_user_id, item_name);
  return embeds;
}

function createServerInventoryPullEmbed(discord_user_id, item_name, quantity) {
  console.log("Server inventory pull request command sent");
  // make sure user exists
  const USERS = JSON.parse(fs.readFileSync("./linked_users.json"));
  let user = undefined;
  let mcusername = "";
  for (let x in USERS) {
    if (USERS[x].discord_user === discord_user_id) {
      user = USERS[x];
      mcusername = x;
    }
  }
  if (!user)
    return [
      new EmbedBuilder()
        .setColor(0)
        .setTitle(`Inventory Error`)
        .setDescription(
          "You aren't linked to a whitelisted user, please use `link` before pulling from inventory!"
        )
        .setAuthor({
          name: `${SERVER.name} Inventory Manager`,
          iconURL: "https://people.rit.edu/nam6711/icon.png",
        }),
    ];

  // check if item is in inventory, and at the specified quantity
  if (!user.inventory[item_name] || item_name === "tokens")
    return [
      new EmbedBuilder()
        .setColor(0)
        .setTitle(`Inventory Error`)
        .setDescription(
          `You can't pull ${item_name.replace(
            "_",
            " "
          )} out, either because you don't have it or its not able to be removed`
        )
        .setAuthor({
          name: `${SERVER.name} Inventory Manager`,
          iconURL: "https://people.rit.edu/nam6711/icon.png",
        }),
    ];
  if (quantity && user.inventory[item_name].quantity < quantity)
    return [
      new EmbedBuilder()
        .setColor(0)
        .setTitle(`Inventory Error`)
        .setDescription(
          `You don't have enough ${item_name.replace(
            "_",
            " "
          )} in inventory to pull that many out`
        )
        .setAuthor({
          name: `${SERVER.name} Inventory Manager`,
          iconURL: "https://people.rit.edu/nam6711/icon.png",
        }),
    ];
  // check if user is online
  if (!check_if_online(mcusername))
    return [
      new EmbedBuilder()
        .setColor(0)
        .setTitle(`Inventory Error`)
        .setDescription(
          `You have to be logged in to the server to pull an item out!`
        )
        .setAuthor({
          name: `${SERVER.name} Inventory Manager`,
          iconURL: "https://people.rit.edu/nam6711/icon.png",
        }),
    ];

  // if quantity not specified, pull all out
  if (!quantity) quantity = user.inventory[item_name].quantity;
  // update inventory
  user.inventory[item_name].quantity -= quantity;
  // if entity, call summon entity, otherwise give item
  if (user.inventory[item_name].type === "entity")
    summonEntity(mcusername, item_name, quantity);
  else giveItem(mcusername, item_name, quantity);

  // update inventory
  if (user.inventory[item_name].quantity === 0)
    delete user.inventory[item_name];
  fs.writeFileSync("./linked_users.json", JSON.stringify(USERS));

  return [
    new EmbedBuilder()
      .setColor(STATUS_COLORS["idle"])
      .setTitle(`${mcusername}'s Inventory!`)
      .setDescription("The item was successfully pulled from your inventory")
      .setAuthor({
        name: `${SERVER.name} Inventory Manager`,
        iconURL: "https://people.rit.edu/nam6711/icon.png",
      }),
  ];
}

module.exports = {
  initializeCommands,
  createServerStatusEmbed,
  createServerShutDownEmbed,
  createServerStartUpEmbed,
  createServerStatusChangeErrorEmbed,
  createServerMessageEmbed,
  createServerWhitelistEmbed,
  createServerGambitEmbed,
  createServerGambitListWagersEmbed,
  createServerInventoryEmbed,
  createServerTradeEmbed,
  createServerInventoryPullEmbed,
  createServerGambitOptionsEmbed,
  buildListEmbed,
  createServerLinkEmbed,
};
