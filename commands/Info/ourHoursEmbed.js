const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ourhours')
    .setDescription('View our business hours.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Our Hours')
      .setDescription("We're currently not open for business yet, however we'll let you know when this changes.")
      .setColor('#213567')
      .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
      .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });

    try {
      const channel = await interaction.client.channels.fetch('1354669582400356363');

      await channel.send({ embeds: [embed] });

      await interaction.reply({ content: 'Sent the Our Hours embed.', ephemeral: true });
    } catch (error) {
      console.error('Error sending embed:', error);
      await interaction.reply({ content: 'An error occurred while sending the Our Hours embed.', ephemeral: true });
    }
  },
};


