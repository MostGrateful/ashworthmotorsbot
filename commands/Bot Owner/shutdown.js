require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Shuts down the bot (Bot Owner Only).'),

  async execute(interaction) {
    const ownerId = process.env.BOT_OWNER_ID;

    if (interaction.user.id !== ownerId) {
      return await interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    await interaction.reply({ content: '🛑 Bot is shutting down...', ephemeral: true });
    console.log(`Bot shutdown initiated by ${interaction.user.tag} (${interaction.user.id})`);
    process.exit(0);
  },
}