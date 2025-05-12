const { SlashCommandBuilder } = require("discord.js");
const {
  createServerStatusChangeErrorEmbed,
  createServerWhitelistEmbed,
} = require("../../command_manager");
const { whitelist } = require("../../mcserver_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("whitelists a player to the server")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("name of the user to add")
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
    let embeds = createServerWhitelistEmbed(username);
    // if not an error from server status, then start the server!
    if (embeds) {
      whitelist(username);
    } else {
      embeds = createServerStatusChangeErrorEmbed(
        "The server needs to be on in order to whitelist someone!"
      );
    }
    await interaction.reply({ embeds: embeds });
  },
};
