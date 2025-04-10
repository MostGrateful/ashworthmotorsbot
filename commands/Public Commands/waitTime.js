const { SlashCommandBuilder } = require('discord.js');

const ALLOWED_ROLES = [
  '1354672092288909445',
  '1354672089977847895',
  '1357520387512078356',
  '1357520385569980446',
  '1357520375361048807'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waittime')
    .setDescription('View or set the current wait time.')
    .addStringOption(option =>
      option.setName('set')
        .setDescription('Set a new wait time (example: 5 Minutes)')
        .setRequired(false)
    ),

  async execute(interaction, db) {
    const newTime = interaction.options.getString('set');

    const [rows] = await db.promise().query('SELECT business_status, wait_time FROM settings WHERE id = 1');
    const status = rows[0].business_status;
    const waitTime = rows[0].wait_time;

    const waitChannel = interaction.guild.channels.cache.get('1357252016337977414');

    if (!newTime) {
      return interaction.reply(`Current Wait Time: ${waitTime}`);
    }

    if (!interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
      return interaction.reply({ content: 'You do not have permission to set wait time.', ephemeral: true });
    }

    if (status === 'closed') {
      return interaction.reply('Business is closed. You cannot modify wait time.');
    }

    await db.query('UPDATE settings SET wait_time = ? WHERE id = 1', [newTime]);
    await waitChannel.setName(`Wait: ${newTime}`);

    return interaction.reply(`Wait time has been updated to ${newTime}.`);
  }
}


