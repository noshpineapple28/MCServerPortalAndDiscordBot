const { SlashCommandBuilder } = require("discord.js");
const {
  createServerShutDownEmbed,
  createServerStatusChangeErrorEmbed,
} = require("../../command_manager");
const { stopServer } = require("../../mcserver_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("if the server is online will shut it down!"),
  async execute(interaction) {
    let embeds = createServerShutDownEmbed();
    // if not an error from server status, then start the server!
    if (embeds) {
      stopServer();
    } else {
      embeds = createServerStatusChangeErrorEmbed("The server needs to be on to turn off! Use /status to check the server status");
    }
    await interaction.reply({ embeds: embeds });
  },
};
