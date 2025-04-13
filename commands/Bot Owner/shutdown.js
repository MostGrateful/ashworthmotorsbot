const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Owner Only - Safely shutdown the bot and go offline immediately.'),

  async execute(interaction, client) {
    const allowedUsers = ['238058962711216130']; // Your Discord ID(s)

    if (!allowedUsers.includes(interaction.user.id)) {
      return await interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
    }

    try {
      await interaction.reply({ content: 'Shutting down... 🛑', ephemeral: true });

      console.log(`Shutdown initiated by ${interaction.user.tag} (${interaction.user.id})`);

      // Immediately set bot status to offline
      await client.user.setStatus('invisible');

      // Delay for status to update before destroying
      setTimeout(() => {
        client.destroy(); // Disconnect bot
        process.exit(0);  // Exit process
      }, 1500); // 1.5s delay ensures status shows offline

    } catch (error) {
      console.error('❌ Error executing /shutdown:', error);

      // Safe fallback reply
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'An error occurred while shutting down.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'An error occurred while shutting down.', ephemeral: true });
      }
    }
  },
};
