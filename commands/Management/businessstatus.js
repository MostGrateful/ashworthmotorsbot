const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set the business status to open or closed.')
    .addStringOption(option =>
      option.setName('state')
        .setDescription('Choose business status')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' },
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });

    const state = interaction.options.getString('state');
    const vcStatusID = '1357251956409765978';
    const vcWaitID = '1357252016337977414';

    // Update status in SQL
    await db.promise().query('UPDATE settings SET business_status = ?', [state]);

    const guild = interaction.guild;
    const vcStatus = guild.channels.cache.get(vcStatusID);
    const vcWait = guild.channels.cache.get(vcWaitID);

    if (state === 'open') {
      await db.promise().query('UPDATE settings SET wait_time = ?', ['0 Minutes']);
      if (vcStatus) await vcStatus.setName('Track Status: Open');
      if (vcWait) await vcWait.setName('Wait Time: 0 Minutes');
    } else {
      await db.promise().query('UPDATE settings SET wait_time = ?', [
        "We're currently closed, please keep an eye in our #press-release for the next race session."
      ]);
      if (vcStatus) await vcStatus.setName('Track Status: Closed');
      if (vcWait) await vcWait.setName('Wait Time: N/A');
    }

    await interaction.editReply({ content: `You've changed the status of the business to ${state.toUpperCase()}.` });
  },
};
