const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set the current business status.')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Choose business status')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Manager roles only

  async execute(interaction, client) {
    const db = client.db;
    const status = interaction.options.getString('status');

    try {
      await db.query('UPDATE settings SET business_status = ? WHERE id = 1', [status]);

      const response = status === 'open'
        ? 'Track is now **OPEN**!'
        : 'Track is now **CLOSED**.';

      await interaction.reply({ content: response, ephemeral: true });

    } catch (error) {
      console.error(`❌ Error in /status:`, error);
      await interaction.reply({ content: 'An unexpected error occurred while updating the status.', ephemeral: true });
    }
  },
};