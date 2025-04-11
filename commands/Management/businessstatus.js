const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set the business status.')
    .addStringOption(option =>
      option.setName('state')
        .setDescription('Choose Open or Closed')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' },
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Optional for staff perms only

  async execute(interaction, db) {
    const state = interaction.options.getString('state');

    const allowedRoles = [
      '1354672092288909445',
      '1354672089977847895',
      '1357520387512078356',
      '1357520385569980446',
      '1357520375361048807',
    ];

    if (!interaction.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    await db.query('UPDATE settings SET business_status = ? WHERE id = 1', [state]);

    const statusVC = await interaction.guild.channels.fetch('1357251956409765978');
    const waitVC = await interaction.guild.channels.fetch('1357252016337977414');

    if (state === 'open') {
      await db.query('UPDATE settings SET wait_time = "0 Minutes" WHERE id = 1');
      await statusVC.setName('Track Status: Open');
      await waitVC.setName('Wait Time: 0 Minutes');
    } else {
      await db.query('UPDATE settings SET wait_time = "We\'re currently closed, please keep an eye in our #press-release for the next race session." WHERE id = 1');
      await statusVC.setName('Track Status: Closed');
      await waitVC.setName('Wait Time: N/A');
    }

    await interaction.editReply({ content: `You've changed the status of the business to **${state.toUpperCase()}**.` });
  },
};

