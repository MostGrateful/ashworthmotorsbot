const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Displays information about Ashworth Motorsports.'),

  async execute(interaction, client) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('Ashworth Motorsports')
        .setDescription('Ashworth Motorsports is the revolution of Go-Karting within Firestone!')
        .addFields(
          { name: 'Founded', value: '2024', inline: true },
          { name: 'Owner', value: 'James_Ashworth', inline: true },
          { name: 'Operations', value: 'Providing safe & thrilling racing experiences!' },
        )
        .setFooter({ text: 'Ashworth Motorsports | Firestone' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error(`❌ Error in /info:`, error);
      await interaction.reply({ content: 'An error occurred while fetching information.', ephemeral: true });
    }
  },
};
