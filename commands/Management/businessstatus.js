const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Update the business status (Open/Closed)')
    .addStringOption(option =>
      option.setName('state')
        .setDescription('Choose Open or Closed')
        .setRequired(true)
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Closed', value: 'closed' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction, client) {
    const db = client.db; // Grabbing db from client properly now
    const status = interaction.options.getString('state');

    const trackVC = await interaction.guild.channels.fetch('1357251956409765978');
    const waitVC = await interaction.guild.channels.fetch('1357252016337977414');

    if (!trackVC || !waitVC) {
      return interaction.reply({ content: 'Track or Wait Time VC not found.', ephemeral: true });
    }

    await db.execute('UPDATE settings SET business_status = ?, wait_time = ? WHERE id = 1',
      status === 'open'
        ? ['Open', '0 Minutes']
        : ['Closed', `We're currently closed, please keep an eye in our <#1354670500529307648> for the next race session.`]
    );

    await trackVC.setName(`Track Status: ${status === 'open' ? 'Open' : 'Closed'}`);
    await waitVC.setName(`Wait Time: ${status === 'open' ? '0 Minutes' : 'N/A'}`);

    await interaction.reply({
      content: `You've changed the status of the business to **${status.charAt(0).toUpperCase() + status.slice(1)}**.`,
      ephemeral: true
    });
  },
};


