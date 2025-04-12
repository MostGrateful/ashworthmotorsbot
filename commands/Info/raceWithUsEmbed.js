const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('racewithus')
    .setDescription('Learn how to race with Ashworth Motorsports.'),

  async execute(interaction, client) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('Race With Us at Ashworth Motorsports!')
        .setDescription('Interested in racing with us? Here\'s everything you need to know!')
        .addFields(
          { name: 'Announcements', value: 'Stay updated by watching our #press-release channel for upcoming race sessions.' },
          { name: 'Joining a Race', value: 'When a session is active, join the Track VC and listen to staff instructions.' },
          { name: 'Safety First', value: 'Ensure you follow all staff directions and wear proper safety gear.' },
        )
        .setFooter({ text: 'Ashworth Motorsports | Firestone' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('❌ Error executing /racewithus:', error);
      await interaction.reply({
        content: 'An error occurred while fetching race information.',
        ephemeral: true,
      });
    }
  },
};
