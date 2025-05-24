const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const { createServerTradeEmbed } = require("../../command_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trade")
    .setDescription("trade with kitch the wandering thief")
    .addStringOption((option) =>
      option
        .setName("item_name")
        .setDescription(
          "name of the item you'd like to purchase [NOT CASE SENSITIVE]"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    let item = interaction.options
      .getString("item_name")
      .replace(" ", "_")
      .toLowerCase();
    let embeds = createServerTradeEmbed(interaction.user.id, item);
    // if trade succeeded, youll get this
    if (embeds === true)
      embeds = [
        new EmbedBuilder()
          .setTitle("Inventory Update")
          .setColor(0x915930)
          .setDescription(
            `I'll package that up for ya, stow that in yer inventory until ya need it`
          )
          .setAuthor({
            name: `Kitch the Thief`,
            iconURL: "https://people.rit.edu/nam6711/maintainance.png",
          }),
      ];
    // if not an error from server status, then start the server!
    await interaction.reply({ embeds: embeds, flags: MessageFlags.Ephemeral });
  },
};
