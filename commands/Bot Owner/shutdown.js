const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Owner Only - Safely shutdown the bot.'),

  async execute(interaction, client) {
    const allowedUsers = ['238058962711216130']; // Replace with your Discord ID(s)

    if (!allowedUsers.includes(interaction.user.id)) {
      return await interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
    }

    try {
      await interaction.reply({ content: 'Shutting down... 🛑', ephemeral: true });

      console.log(`Shutdown initiated by ${interaction.user.tag} (${interaction.user.id})`);

      await client.destroy();

      process.exit(0); // Force exit just in case

    } catch (error) {
      console.error('❌ Error executing /shutdown:', error);

      await interaction.reply({
        content: 'An error occurred while attempting to shutdown the bot.',
        ephemeral: true,
      });
    }
  },
};
