const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createServerGambitEmbed } = require("../../command_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wager")
    .setDescription("wager tokens for the current gambit")
    .addIntegerOption((option) =>
      option
        .setName("tokens")
        .setDescription("how many tokens you'd like to wager")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prediction")
        .setDescription("your prediction for the current gambit")
        .setRequired(true)
    ),
  async execute(interaction) {
    const tokens = interaction.options.getInteger("tokens");
    const prediction = interaction.options.getString("prediction");
    let embeds = createServerGambitEmbed(
      interaction.user.id,
      tokens,
      prediction
    );
    // if not an error from server status, then start the server!
    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
