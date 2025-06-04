const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
  TextChannel,
  MessageFlags,
} = require("discord.js");
// values needed for starting the bot
const { token } = require("./config.json");
const { EmbedBuilder } = require("@discordjs/builders");
const {
  create_gambit,
  change_gambit_win_condition,
  process_gambit_input,
} = require("./gambits/gambit");
const { link_helper } = require("./helpers/embeds");
const { SomeoneDiesGambit } = require("./gambits/SomeoneDiesGambit");
const { MurderGambit } = require("./gambits/MurderGambit");
const { summon_trader } = require("./trader/trader_helper");
const { KillAnEntityGambit } = require("./gambits/KillAnEntityGambit");
const { GetAnItemGambit } = require("./gambits/GetAnItemGambit");
// client!
let client;
let SERVER;

// ids of discord channels we will be sending to
const CHANNEL_IDS = [];
const CHANNEL_CHAT_IDS = [];

// used for the side pannel colors of embeds
const ALERT_TYPES = {
  advancment: 0x4d841f,
  message: 0x31a4d4,
  death: 0x702a2a,
};

function initializeListener(servers) {
  // copy servers over
  SERVER = servers;
}

/**
 * starts the discord bot client to allow it to respond and react
 *    to plugin updates
 */
function startClient() {
  // Create a new client instance
  client = new Client({ intents: [GatewayIntentBits.Guilds] });
  // set slash commands
  client.commands = new Collection();
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // Log in to Discord with your client's token
  client.login(token);

  // after bot is readied, gather channels we will post to
  client.on("ready", () => {
    client.user.setStatus("idle");

    const Guilds = client.guilds.cache.map((guild) => guild.id);
    // for every guild we're in
    for (let guild of Guilds) {
      const channels = client.guilds.cache.get(guild).channels.cache;
      // go through all channels in a guild and save the one labeled
      for (let channel of channels) {
        if (
          channel[1].name === SERVER.name.toLowerCase() &&
          channel[1] instanceof TextChannel
        ) {
          CHANNEL_IDS.push(channel[1].id);
        }
        if (
          channel[1].name === `${SERVER.name.toLowerCase()}-chat` &&
          channel[1] instanceof TextChannel
        ) {
          CHANNEL_CHAT_IDS.push(channel[1].id);
        }
      }
    }

    // initiate helper method links
    link_helper(client, CHANNEL_IDS);
    // handle gamble MUST HAPPEN AFTER HELPER IS COMPLETE
    let wait = new Date();
    wait.setHours(wait.getHours() + Math.floor(Math.random() * 24));
    wait.setMinutes(wait.getMinutes() + Math.floor(Math.random() * 60));
    let cur = new Date();
    setTimeout(create_gambit, wait.getTime() - cur.getTime());
    // create wandering trader in 10 mins after starting
    wait = new Date();
    wait.setHours(wait.getHours() + Math.floor(Math.random() * 24));
    wait.setMinutes(wait.getMinutes() + Math.floor(Math.random() * 60));
    cur = new Date();
    setTimeout(summon_trader, wait.getTime() - cur.getTime());
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  });
}

/**
 * given an event string, parses it and turns it into an embed for the server
 * @param {String} event a string containing event details
 * @returns none
 */
function parseEvent(event) {
  console.log(event);
  let event_details = event.split(";");
  let embeds = [];

  // create the embeds!
  switch (event_details[1]) {
    // advancement embed
    case "ADVANCEMENT": {
      embeds.push(
        buildAdvancementEmbed(
          event_details[2],
          event_details[3],
          event_details[4]
        )
      );
      break;
    }
    // message embed
    case "MESSAGE": {
      embeds.push(buildMessageEmbed(event_details[2], event_details[3]));
      break;
    }
    // death message embed
    case "DEATH": {
      embeds.push(buildDeathEmbed(event_details[2], event_details[3]));
      if (checkForMurder(event_details[3]))
        change_gambit_win_condition(new MurderGambit(), "yes", true);
      else change_gambit_win_condition(new SomeoneDiesGambit(), "yes", true);
      break;
    }
    case "START": {
      embeds.push(buildStartupEmbed());
      client.user.setStatus("online");
      break;
    }
    case "STOP": {
      embeds.push(buildStopEmbed());
      client.user.setStatus("idle");
      break;
    }
    case "ENTITYKILLEVENT": {
      process_gambit_input(
        new KillAnEntityGambit(),
        event_details[2],
        event_details[3]
      );
      return;
    }
    case "ENTITYITEMPICKUPEVENT": {
      process_gambit_input(
        new GetAnItemGambit(),
        event_details[2],
        event_details[3]
      );
      return;
    }
    default: {
      console.log("Non Embed event: ", event);
      return;
    }
  }

  // send chat messages to the chat channel
  if (event_details[1] === "MESSAGE") {
    for (const CHAT_ID of CHANNEL_CHAT_IDS) {
      const channel = client.channels.cache.get(CHAT_ID);
      channel.send({
        embeds: embeds,
      });
    }
  } else {
    // send the embeds to every channel
    for (const CHANNEL_ID of CHANNEL_IDS) {
      const channel = client.channels.cache.get(CHANNEL_ID);
      channel.send({
        embeds: embeds,
      });
    }
  }
}

function checkForMurder(message) {
  // get all players on the whitelist
  let murder_occured = false;
  WHITELISTED_USERS = JSON.parse(fs.readFileSync("../whitelist.json"));
  WHITELISTED_USERS.forEach((user) => {
    if (message.includes(` by ${user.name}`)) murder_occured = true;
  });
  return murder_occured;
}

function buildStartupEmbed() {
  console.log("Startup message sent");
  return new EmbedBuilder()
    .setColor(0x5bcc5b)
    .setTitle(`${SERVER.name} Server Status`)
    .setDescription(`The server is online`)
    .setAuthor({
      name: `${SERVER.name} Server Manager`,
      iconURL: "https://people.rit.edu/nam6711/maintainance.png",
    });
}

function buildStopEmbed() {
  console.log("Stop message sent");
  return new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle(`${SERVER.name} Server Status`)
    .setDescription(`The server is offline`)
    .setAuthor({
      name: `${SERVER.name} Server Manager`,
      iconURL: "https://people.rit.edu/nam6711/maintainance.png",
    });
}

/**
 * generates an embed relating to advancements
 * @param {String} player player name
 * @param {String} advancement advancement name
 * @param {String} requirements requirements for advancment
 * @returns Embed
 */
function buildAdvancementEmbed(player, advancement, requirements) {
  console.log("Advancement message sent");
  client.user.setActivity(`Celebrating ${player}'s new advancement!`, {
    type: ActivityType.Custom,
  });

  return new EmbedBuilder()
    .setColor(ALERT_TYPES.advancment)
    .setTitle("Advancement Get!")
    .setDescription(`${player} has made the advancement **[${advancement}]**`)
    .setAuthor({
      name: `${SERVER.name} News Flash`,
      iconURL: "https://people.rit.edu/nam6711/news.png",
    })
    .addFields({ name: `${advancement}`, value: `${requirements}` });
}

/**
 * generates an embed relating to advancmessagesements
 * @param {String} player player name
 * @param {String} message message sent
 * @returns Embed
 */
function buildMessageEmbed(player, message) {
  console.log("Chat message sent");
  return new EmbedBuilder()
    .setColor(ALERT_TYPES.message)
    .setTitle("Chat Message")
    .setDescription(`<${player}> ${message}`)
    .setAuthor({
      name: `${SERVER.name} IMS`,
      iconURL: "https://people.rit.edu/nam6711/icon.png",
    });
}

/**
 * generates an embed relating to deaths
 * @param {String} player player name
 * @param {String} message message sent
 * @returns Embed
 */
function buildDeathEmbed(player, message) {
  console.log("Death message sent");
  client.user.setActivity(`Mourning ${player}'s death`, {
    type: ActivityType.Custom,
  });
  return new EmbedBuilder()
    .setColor(ALERT_TYPES.death)
    .setTitle(`${player} has died`)
    .setDescription(`${message}`)
    .setAuthor({
      name: `${SERVER.name} Obituary System`,
      iconURL: "https://people.rit.edu/nam6711/death.png",
    });
}

// exports
module.exports = { initializeListener, startClient, parseEvent };
