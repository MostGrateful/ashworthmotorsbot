const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('safetystatement')
    .setDescription('View our safety statement.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Safety Statement')
      .setDescription(`
        At Ashworth Motorsports, safety is our top priority. We believe in providing a thrilling experience while ensuring that all players are safe. 

        Our Go-Karts are designed with safety features that ensure stability and reliability, and all drivers are encouraged to follow the safety guidelines provided before racing.

        We also have a dedicated team of marshals who monitor the track during all races to ensure the safety of all participants. We want to make sure everyone has fun, but we want to make sure you stay safe too!

        Always wear your helmet, follow the instructions, and race responsibly. We’re committed to making your racing experience as exciting and safe as possible. Have fun and race smart!
      `)
      .setColor('#213567')
      .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
      .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });

    try {
      const channel = await interaction.client.channels.fetch('1354669582400356363');

      await channel.send({ embeds: [embed] });

      await interaction.reply({ content: 'Sent the Safety Statement embed.', ephemeral: true });
    } catch (error) {
      console.error('Error sending embed:', error);
      await interaction.reply({ content: 'An error occurred while sending the Safety Statement embed.', ephemeral: true });
    }
  },
};


