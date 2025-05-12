const { EmbedBuilder } = require("discord.js");
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

module.exports = {
  initializeCommands,
  createServerStatusEmbed,
  createServerShutDownEmbed,
  createServerStartUpEmbed,
  createServerStatusChangeErrorEmbed,
  createServerMessageEmbed,
  createServerWhitelistEmbed,
  buildListEmbed,
};
