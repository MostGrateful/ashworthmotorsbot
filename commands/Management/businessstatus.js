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
          { name: 'Closed', value: 'closed' },
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const db = client.db;
    const status = interaction.options.getString('status');

    const trackVC = await interaction.guild.channels.fetch('1357251956409765978').catch(() => null);
    const waitTimeVC = await interaction.guild.channels.fetch('1357252016337977414').catch(() => null);

    try {
      await db.query('UPDATE settings SET business_status = ? WHERE id = 1', [status]);

      if (status === 'open') {
        if (trackVC) await trackVC.setName('Track Status: Open').catch(() => {});
        if (waitTimeVC) await waitTimeVC.setName('Wait Time: 0 Minutes').catch(() => {});
        await db.query('UPDATE settings SET wait_time = "0 Minutes" WHERE id = 1');
      } else {
        if (trackVC) await trackVC.setName('Track Status: Closed').catch(() => {});
        if (waitTimeVC) await waitTimeVC.setName('Wait Time: N/A').catch(() => {});
        await db.query('UPDATE settings SET wait_time = "We\'re currently closed, please keep an eye in our #press-release for the next race session." WHERE id = 1');
      }

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
