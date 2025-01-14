const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");
// values needed for starting the bot
const { token } = require("./config.json");
const { EmbedBuilder } = require("@discordjs/builders");
// client!
let client;

// ids of discord channels we will be sending to
const CHANNEL_IDS = [];

// used for the side pannel colors of embeds
const ALERT_TYPES = {
  advancment: 0x4d841f,
  message: 0x31a4d4,
  death: 0x702a2a,
};

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
    const Guilds = client.guilds.cache.map((guild) => guild.id);
    // for every guild we're in
    for (let guild of Guilds) {
      const channels = client.guilds.cache.get(guild).channels.cache;
      // go through all channels in a guild and save the one labeled continuum
      for (let channel of channels) {
        if (channel[1].name === "continuum") {
          CHANNEL_IDS.push(channel[1].id);
        }
      }
    }
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
      break;
    }
    case "START": {
      embeds.push(buildStartupEmbed());
      break;
    }
    case "STOP": {
      embeds.push(buildStopEmbed());
      break;
    }
    default: {
      console.log("Non Embed event: ", event);
      return;
    }
  }

  // send the embeds to every channel
  for (const CHANNEL_ID of CHANNEL_IDS) {
    const channel = client.channels.cache.get(CHANNEL_ID);
    channel.send({
      embeds: embeds,
    });
  }
}

function buildStartupEmbed() {
  console.log("Startup message sent");
  return new EmbedBuilder()
    .setColor(0x5bcc5b)
    .setTitle("Continuum Server Status")
    .setDescription(`The server is online`)
    .setAuthor({
      name: "Continuum Server Manager",
      iconURL: "https://people.rit.edu/nam6711/icon.png",
    })
}

function buildStopEmbed() {
  console.log("Stop message sent");
  return new EmbedBuilder()
    .setColor(0xffffff)
    .setTitle("Continuum Server Status")
    .setDescription(`The server is offline`)
    .setAuthor({
      name: "Continuum Server Manager",
      iconURL: "https://people.rit.edu/nam6711/icon.png",
    })
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
      name: "Continuum News Flash",
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
      name: "Continuum IMS",
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
      name: "Continuum Obituary System",
      iconURL: "https://people.rit.edu/nam6711/death.png",
    });
}

// exports
module.exports = { startClient, parseEvent };
