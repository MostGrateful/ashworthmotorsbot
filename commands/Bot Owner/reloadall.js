const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');
const loadCommands = require('../../core/loadCommands');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reloadall')
    .setDescription('Owner Only - Reloads all commands.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const allowedUsers = ['238058962711216130']; // Your ID

    if (!allowedUsers.includes(interaction.user.id)) {
      return await interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
    }

    try {
      const commands = [];
      loadCommands(path.join(__dirname, '../../commands'), commands, client);

      await interaction.reply({
        content: `✅ Reloaded all ${commands.length} commands successfully.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error('❌ Error reloading all commands:', error);
      await interaction.reply({ content: '❌ Failed to reload commands.', ephemeral: true });
    }
  },
};
