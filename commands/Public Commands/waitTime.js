const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waittime')
    .setDescription('View or set the current wait time')
    .addStringOption(option =>
      option.setName('set')
        .setDescription('Set a new wait time')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, db) {
    const newWaitTime = interaction.options.getString('set');

    const waitTimeVC = '1357252016337977414';

    const [rows] = await db.query('SELECT business_status, wait_time FROM settings WHERE id = 1');
    const { business_status, wait_time } = rows[0];

    if (!newWaitTime) {
      return await interaction.reply({ content: `Current Wait Time: ${wait_time}`, ephemeral: true });
    }

    if (business_status === 'closed') {
      return await interaction.reply({ content: 'You cannot change the wait time while the business is closed.', ephemeral: true });
    }

    await db.query('UPDATE settings SET wait_time = ? WHERE id = 1', [newWaitTime]);

    await interaction.guild.channels.cache.get(waitTimeVC)?.setName(`Wait: ${newWaitTime}`);

    await interaction.reply({ content: `Wait time has been updated to ${newWaitTime}`, ephemeral: true });
  },
};



