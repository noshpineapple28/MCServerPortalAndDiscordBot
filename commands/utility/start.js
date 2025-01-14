const { SlashCommandBuilder } = require("discord.js");
const {
  createServerStartUpEmbed,
  createServerStatusChangeErrorEmbed,
} = require("../../command_manager");
const { startServer } = require("../../mcserver_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start")
    .setDescription("if the server is offline will start it up!"),
  async execute(interaction) {
    let embeds = createServerStartUpEmbed();
    // if not an error from server status, then start the server!
    if (embeds) {
      startServer();
    } else {
      embeds = createServerStatusChangeErrorEmbed("The server needs to be off to turn on! Use /status to check the server status");
    }
    await interaction.reply({ embeds: embeds });
  },
};
