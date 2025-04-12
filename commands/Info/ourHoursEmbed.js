const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ourhours')
    .setDescription('View Ashworth Motorsports operating hours.'),

  async execute(interaction, client) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('Ashworth Motorsports - Operating Hours')
        .setDescription('Our race sessions vary based on availability and staff. Please review our typical hours below, but always check #press-release for real-time session announcements!')
        .addFields(
          { name: 'Weekdays', value: 'Usually Evenings (EST)\n*Exact times depend on staff availability.*' },
          { name: 'Weekends', value: 'Flexible race times throughout the day and evening.' },
          { name: 'Announcements', value: 'Follow #press-release for the latest race session schedules!' },
        )
        .setFooter({ text: 'Ashworth Motorsports | Firestone' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('❌ Error executing /ourhours:', error);
      await interaction.reply({
        content: 'An error occurred while fetching our operating hours.',
        ephemeral: true,
      });
    }
  },
};

