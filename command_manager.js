const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { process_wager, process_wager_listing } = require("./gambits/gambit");
const LINKED_USERS = require("./linked_users.json");
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
  if (LINKED_USERS[username])
    LINKED_USERS[username].discord_user = discord_user_id;
  else
    LINKED_USERS[username] = {
      discord_user: discord_user_id,
      inventory: {
        tokens: 10,
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

function createServerGambitListWagersEmbed(discord_user_id) {
  console.log("Server gambit list wagers command sent");

  const embeds = process_wager_listing(discord_user_id);
  return embeds;
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
  buildListEmbed,
  createServerLinkEmbed,
};
