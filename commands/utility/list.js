const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const {
  createServerStatusChangeErrorEmbed,
  buildListEmbed,
} = require("../../command_manager");
const { query_players } = require("../../mcserver_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("lists which players are online"),
  async execute(interaction) {
    result = query_players();
    let embeds = buildListEmbed(result[0], result[1]);
    // if not an error from server status, then start the server!
    if (embeds) {
    } else {
      embeds = createServerStatusChangeErrorEmbed(
        "Nobodys online, the servers off!"
      );
    }
    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
