const { SlashCommandBuilder } = require("discord.js");
const { createServerStatusEmbed } = require("../../command_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Gets the current status of the server!"),
  async execute(interaction) {
    await interaction.reply({ embeds: createServerStatusEmbed() });
  },
};
