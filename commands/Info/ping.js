const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  /**
   * Execute the /ping command
   * @param {import('discord.js').ChatInputCommandInteraction} interaction 
   * @param {import('discord.js').Client} client 
   */
  async execute(interaction, client) {
    try {
      const sent = await interaction.reply({ content: 'Pong!', fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      await interaction.editReply(`🏓 Pong! Latency is ${latency}ms.`);
    } catch (error) {
      console.error('Ping command error:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing ping.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error executing ping.', ephemeral: true });
      }
    }
  }
};



