const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waittime')
    .setDescription('View or set the current wait time.')
    .addStringOption(option =>
      option.setName('set')
        .setDescription('Set a new wait time')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, db) {
    await interaction.deferReply({ ephemeral: true });

    const newTime = interaction.options.getString('set');
    const vcWaitID = '1357252016337977414';

    const [statusResult] = await db.promise().query('SELECT business_status, wait_time FROM settings WHERE id = 1');
    const businessStatus = statusResult[0].business_status;
    const currentWaitTime = statusResult[0].wait_time;

    if (!newTime) {
      await interaction.editReply({ content: `Current wait time is: ${currentWaitTime}` });
      return;
    }

    if (businessStatus === 'closed') {
      await interaction.editReply({ content: 'Cannot set wait time while business is closed.' });
      return;
    }

    await db.promise().query('UPDATE settings SET wait_time = ?', [newTime]);

    const vcWait = interaction.guild.channels.cache.get(vcWaitID);
    if (vcWait) await vcWait.setName(`Wait Time: ${newTime}`);

    await interaction.editReply({ content: `Wait time has been updated to: ${newTime}` });
  },
};



