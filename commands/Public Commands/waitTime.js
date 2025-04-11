const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waittime')
    .setDescription('View or set the wait time.')
    .addStringOption(option =>
      option.setName('set')
        .setDescription('Provide a new wait time (optional)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, db) {
    const newTime = interaction.options.getString('set');

    const allowedRoles = [
      '1354672092288909445',
      '1354672089977847895',
      '1357520387512078356',
      '1357520385569980446',
      '1357520375361048807',
    ];

    await interaction.deferReply({ ephemeral: true });

    const [rows] = await db.query('SELECT business_status, wait_time FROM settings WHERE id = 1');
    const status = rows[0].business_status;
    const currentTime = rows[0].wait_time;

    if (!newTime) {
      return interaction.editReply({ content: `Current wait time is: **${currentTime}**` });
    }

    if (!interaction.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
      return interaction.editReply({ content: 'You do not have permission to set the wait time.' });
    }

    if (status === 'closed') {
      return interaction.editReply({ content: 'The business is currently closed. You cannot modify the wait time.' });
    }

    await db.query('UPDATE settings SET wait_time = ? WHERE id = 1', [newTime]);

    const waitVC = await interaction.guild.channels.fetch('1357252016337977414');
    await waitVC.setName(`Wait Time: ${newTime}`);

    await interaction.editReply({ content: `Wait time has been updated to: **${newTime}**` });
  },
};git status


