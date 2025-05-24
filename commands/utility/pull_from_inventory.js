const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { createServerInventoryPullEmbed } = require("../../command_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pull_from_inventory")
    .setDescription("pull item from your inventory")
    .addStringOption((option) =>
      option
        .setName("item_name")
        .setDescription(
          "name of the item you'd like to pull from your inventory [NOT CASE SENSITIVE]"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("quantity")
        .setDescription(
          "specify how many to pull, or leave empty to pull all"
        )
    ),
  async execute(interaction) {
    let item = interaction.options
      .getString("item_name")
      .replace(" ", "_")
      .toLowerCase();
    let quantity = interaction.options.getInteger("quantity")
    let embeds = createServerInventoryPullEmbed(interaction.user.id, item, quantity);
    // if not an error from server status, then start the server!
    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
