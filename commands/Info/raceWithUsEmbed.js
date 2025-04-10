const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('racewithus')
    .setDescription('Get information about racing with us.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Race with Us')
      .setDescription("Our track is currently under construction and isn’t ready yet. Please stay tuned for updates. We can’t wait to welcome you to an exciting racing experience once it's finished!")
      .setColor('#213567')
      .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
      .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });

    try {
      const channel = await interaction.client.channels.fetch('1354669582400356363');

      await channel.send({ embeds: [embed] });

      await interaction.reply({ content: 'Sent the Race with Us embed.', ephemeral: true });
    } catch (error) {
      console.error('Error sending embed:', error);
      await interaction.reply({ content: 'An error occurred while sending the Race with Us embed.', ephemeral: true });
    }
  },
};

