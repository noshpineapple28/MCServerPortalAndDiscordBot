const { SlashCommandBuilder } = require("discord.js");
const {
  createServerStatusChangeErrorEmbed,
  createServerLinkEmbed,
} = require("../../command_manager");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("links a whitelisted player to your discord account")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("name of the whitelisted user to link yourself to")
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
    let sender =
      interaction.member.nickname ??
      interaction.user.globalName ??
      interaction.user.username;
    let embeds = createServerLinkEmbed(username, sender, interaction.user.id);
    // if not an error from server status, then start the server!
    if (!embeds) {
      embeds = createServerStatusChangeErrorEmbed(
        `${username} is not an existing whitelisted user`
      );
    }
    await interaction.reply({ embeds: embeds });
  },
};
