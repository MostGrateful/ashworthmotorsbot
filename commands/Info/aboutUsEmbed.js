const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aboutus')
    .setDescription('Learn more about Ashworth Motorsports.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('About Us')
      .setDescription(`
Welcome to Ashworth Motorsports, where speed, thrill, and fun collide! Located in the dynamic world of Firestone, we specialize in offering the most exciting and exhilarating Go-Kart experiences on Roblox. Whether you're seeking a high-speed challenge, a place to race with friends, or just an exciting way to dive into the world of motorsports, Ashworth Motorsports is your ultimate destination.

Our Go-Karts are designed to provide players of all ages with an unforgettable racing experience. At Ashworth Motorsports, we’re all about pushing the limits of fun while making safety our top priority. Our team is committed to upholding the highest standards of performance, ensuring that every race is smooth, safe, and filled with adrenaline-pumping excitement.

Join us at Ashworth Motorsports for the ride of a lifetime and feel the rush of competition as you race toward victory. We can't wait to see you on the track!
      `)
      .setColor('#213567')
      .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
      .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Discord Invite')
        .setStyle(ButtonStyle.Link)
        .setEmoji('<:discord:1359671444996489508>')
        .setURL('https://discord.gg/MTqjYczmWk'),
      new ButtonBuilder()
        .setLabel('Roblox Group')
        .setStyle(ButtonStyle.Link)
        .setEmoji('<:ams:1359674241850802176>')
        .setURL('https://www.roblox.com/communities/3235650/Ashworth-Motorsports#!/about'),
      new ButtonBuilder()
        .setLabel('Business Permit')
        .setStyle(ButtonStyle.Link)
        .setEmoji('<:permit:1359671343460913323>')
        .setURL('https://trello.com/c/IPfDrdwl/4010-ashworth-motorsports')
    );

    const targetChannel = interaction.client.channels.cache.get('1354669582400356363');

    if (!targetChannel) {
      return interaction.reply({
        content: '❌ Failed to find the target channel to send the embed.',
        ephemeral: true,
      });
    }

    await targetChannel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: '✅ Embed successfully sent to the designated channel.',
      ephemeral: true,
    });
  },
};
