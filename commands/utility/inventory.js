const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const {
  createServerInventoryEmbed,
  createServerStatusChangeErrorEmbed,
} = require("../../command_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription(
      "view your inventory"
    ),
  async execute(interaction) {
    let sender =
      interaction.member.nickname ??
      interaction.user.globalName ??
      interaction.user.username;
    let embeds = createServerInventoryEmbed(interaction.user.id, sender);
    if (!embeds) {
      embeds = createServerStatusChangeErrorEmbed(
        "You haven't linked your account with a whitelisted member! Do that first to get an inventory."
      );
    }
    // if not an error from server status, then start the server!
    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
