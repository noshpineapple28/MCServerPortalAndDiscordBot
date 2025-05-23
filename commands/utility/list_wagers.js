const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createServerGambitListWagersEmbed } = require("../../command_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list_wagers")
    .setDescription("list out all your wagers and predictions for the current gambit"),
  async execute(interaction) {
    let embeds = createServerGambitListWagersEmbed(
      interaction.user.id
    );
    // if not an error from server status, then start the server!
    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
