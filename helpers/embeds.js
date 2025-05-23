let CHANNEL_IDS = [];
let CLIENT

/**
 * must be called for helper methods to work
 * @param {Client} client
 * @param {ChannelIDS} channel_ids
 */
function link_helper(client, channel_ids)
{
    CLIENT = client;
    CHANNEL_IDS = channel_ids;
}

function sendEmbeds(embeds) {
  // send the embeds to every channel
  for (const CHANNEL_ID of CHANNEL_IDS) {
    const channel = CLIENT.channels.cache.get(CHANNEL_ID);
    channel.send({
      embeds: embeds,
    });
  }
}

module.exports = { sendEmbeds, link_helper };
