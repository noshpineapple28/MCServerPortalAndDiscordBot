const { SlashCommandBuilder } = require("discord.js");
const {
  createServerMessageEmbed,
  createServerStatusChangeErrorEmbed,
} = require("../../command_manager");
const { sendMessage } = require("../../mcserver_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("message")
    .setDescription(
      "sends a message to the server for all players [*NOTE: sends server name*]"
    )
    .addStringOption((option) =>
      option
        .setName("format")
        .setDescription(
          "sets the format a message will display in [chat message or title card]"
        )
        .setRequired(true)
        .addChoices(
          { name: "chat", value: "chat" },
          { name: "title", value: "title" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("the text for the message to say")
        .setRequired(true)
    ),
  async execute(interaction) {
    const format = interaction.options.getString("format");
    const text = interaction.options.getString("text");
    let sender =
      interaction.member.nickname ??
      interaction.user.globalName ??
      interaction.user.username;
    let embeds = createServerMessageEmbed(format);
    // if not an error from server status, then start the server!
    if (embeds) {
      sendMessage(format, text, sender);
    } else {
      embeds = createServerStatusChangeErrorEmbed(
        "The server needs to be on in order to send messages!"
      );
    }
    await interaction.reply({ embeds: embeds });
  },
};
