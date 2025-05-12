const { EmbedBuilder } = require("discord.js");
// the status of the server
let SERVERS;

function initializeCommands(servers) {
  // copy servers over
  SERVERS = servers;
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
      .setTitle(`Continuum Server Status`)
      .setDescription(`${error}`)
      .setAuthor({
        name: "Continuum Server Manager",
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerShutDownEmbed() {
  console.log("Server shut down command sent");
  if (SERVERS.Continuum.status !== "on") {
    return false;
  }

  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["off"])
      .setTitle(`Continuum Server Status`)
      .setDescription(`The server is shutting down!`)
      .setAuthor({
        name: "Continuum Server Manager",
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerStartUpEmbed() {
  console.log("Server start up command sent");
  if (SERVERS.Continuum.status !== "off") {
    return false;
  }

  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["on"])
      .setTitle(`Continuum Server Status`)
      .setDescription(`The server is starting up!`)
      .setAuthor({
        name: "Continuum Server Manager",
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
      .setColor(STATUS_COLORS[SERVERS.Continuum.status])
      .setTitle(`Continuum Server Status`)
      .setDescription(`The server is ${SERVERS.Continuum.status}`)
      .setAuthor({
        name: "Continuum Server Manager",
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerWhitelistEmbed(username) {
  console.log("Server status command sent");
  const embeds = [];
  if (SERVERS.Continuum.status !== "on") {
    return false;
  }

  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["idle"])
      .setTitle(`Continuum Server Status`)
      .setDescription(`${username} has been whitelisted to the server`)
      .setAuthor({
        name: "Continuum Server Manager",
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function buildListEmbed(total, players) {
  console.log("Server status command sent");
  const embeds = [];
  if (SERVERS.Continuum.status !== "on") {
    return false;
  }

  embeds.push(
    new EmbedBuilder()
      .setColor(STATUS_COLORS["idle"])
      .setTitle(total)
      .setDescription(players)
      .setAuthor({
        name: "Continuum Server Manager",
        iconURL: "https://people.rit.edu/nam6711/maintainance.png",
      })
  );
  return embeds;
}

function createServerMessageEmbed(format) {
  console.log("Server message command sent");
  if (SERVERS.Continuum.status !== "on") return false;

  const embeds = [];
  embeds.push(
    new EmbedBuilder()
      .setColor(0x31a4d4)
      .setTitle(`Continuum IMS`)
      .setDescription(`A ${format} message was sent!`)
      .setAuthor({
        name: "Continuum IMS",
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
