const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createServerGambitOptionsEmbed } = require("../../command_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wager_options")
    .setDescription("list all viable options for the given wager"),
  async execute(interaction) {
    let embeds = createServerGambitOptionsEmbed();
    // if not an error from server status, then start the server!
    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
