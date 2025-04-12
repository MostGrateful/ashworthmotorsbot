const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set business status')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Choose business status')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' },
        ))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const db = client.db;
    const status = interaction.options.getString('status');

    try {
      await db.query('UPDATE settings SET business_status = ? WHERE id = 1', [status]);
      await interaction.reply({
        content: `Business status has been set to: ${status.toUpperCase()}`,
        ephemeral: true,
      });

    } catch (error) {
      console.error('❌ Error executing /status:', error);
      await interaction.reply({
        content: 'An error occurred while updating the business status.',
        ephemeral: true,
      });
    }
  },
};

