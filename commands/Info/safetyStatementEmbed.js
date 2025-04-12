const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('safetystatement')
    .setDescription('View our Safety Statement.'),

  async execute(interaction, client) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('Ashworth Motorsports - Safety Statement')
        .setDescription('Safety is our number one priority at Ashworth Motorsports. We are committed to ensuring a safe and enjoyable experience for all guests and staff.')
        .addFields(
          { name: 'Track Safety', value: 'All track personnel are trained and certified to operate around go-karts and handle emergency situations.' },
          { name: 'Emergency Response', value: 'Ashworth Motorsports has a detailed Emergency Response Plan (ERP) and employs certified medical personnel such as EMT-B staff for on-site emergencies.' },
          { name: 'Rider Responsibility', value: 'All riders must follow safety instructions, wear proper gear, and listen to staff at all times.' },
        )
        .setFooter({ text: 'Ashworth Motorsports | Firestone' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('❌ Error executing /safetystatement:', error);
      await interaction.reply({
        content: 'An error occurred while fetching the safety statement.',
        ephemeral: true,
      });
    }
  },
};



