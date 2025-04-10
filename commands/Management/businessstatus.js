const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set the business status')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Choose Open or Closed')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, db) {
    const status = interaction.options.getString('status');

    const businessStatusVC = '1357251956409765978';
    const waitTimeVC = '1357252016337977414';

    const guild = interaction.guild;

    await db.query('UPDATE settings SET business_status = ? WHERE id = 1', [status]);

    if (status === 'open') {
      await db.query('UPDATE settings SET wait_time = ? WHERE id = 1', ['0 Minutes']);

      await guild.channels.cache.get(businessStatusVC)?.setName('Track Status: Open');
      await guild.channels.cache.get(waitTimeVC)?.setName('Wait: 0 Minutes');
    } else if (status === 'closed') {
      await db.query('UPDATE settings SET wait_time = ? WHERE id = 1', [
        `We're currently closed, please keep an eye in our <#1354670500529307648> for the next race session.`,
      ]);

      await guild.channels.cache.get(businessStatusVC)?.setName('Track Status: Closed');
      await guild.channels.cache.get(waitTimeVC)?.setName('Wait: ');
    }

    await interaction.reply({ content: `You've changed the status of the business to ${status.charAt(0).toUpperCase() + status.slice(1)}.`, ephemeral: true });
  },
};
