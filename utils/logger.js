const { ChannelType } = require('discord.js');

module.exports = {
  async log(guild, message) {
    const logChannelId = '1354669298060365884'; // Your log channel ID

    const logChannel = guild.channels.cache.get(logChannelId);

    if (!logChannel || logChannel.type !== ChannelType.GuildText) return;

    try {
      await logChannel.send({ content: message });
    } catch (error) {
      console.error('❌ Failed to send log message:', error);
    }
  },
};
