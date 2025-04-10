const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const ALLOWED_ROLES = [
  '1354672092288909445', 
  '1354672089977847895', 
  '1357520387512078356', 
  '1357520385569980446', 
  '1357520375361048807'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set the business status to Open or Closed.')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Choose business status')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' }
        )
    ),

  async execute(interaction, db) {
    const type = interaction.options.getString('type');

    if (!interaction.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const statusChannel = interaction.guild.channels.cache.get('1357251956409765978'); // Track Status VC
    const waitChannel = interaction.guild.channels.cache.get('1357252016337977414');   // Waittime VC

    if (type === 'open') {
      await db.query('UPDATE settings SET business_status = ?, wait_time = ? WHERE id = 1', ['open', '0 Minutes']);

      await statusChannel.setName('Track Status: Open');
      await waitChannel.setName('Wait: 0 Minutes');

      return interaction.reply('Business status set to Open.');

    } else if (type === 'closed') {
      const closedMessage = "We're currently closed, please keep an eye in our <#1354670500529307648> for the next race session.";

      await db.query('UPDATE settings SET business_status = ?, wait_time = ? WHERE id = 1', ['closed', closedMessage]);

      await statusChannel.setName('Track Status: Closed');
      await waitChannel.setName('Wait: ');

      return interaction.reply('Business status set to Closed.');
    }
  }
}
