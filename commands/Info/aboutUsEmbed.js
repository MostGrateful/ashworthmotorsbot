const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aboutus')
    .setDescription('Displays information about Ashworth Motorsports.'),

  async execute(interaction, client) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('About Ashworth Motorsports')
        .setDescription('Ashworth Motorsports is Firestone\'s premiere Go-Karting experience, dedicated to safety, fun, and adrenaline-fueled racing for all ages.')
        .addFields(
          { name: 'Our Mission', value: 'Delivering thrilling, safe, and unforgettable racing experiences within Firestone.' },
          { name: 'Safety First', value: 'All track staff are certified and trained to handle emergency situations.' },
        )
        .setFooter({ text: 'Ashworth Motorsports | Firestone' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Join Our Discord')
          .setStyle(ButtonStyle.Link)
          .setEmoji('<:discord:YourEmojiID>') 
          .setURL('https://discord.gg/YourInviteLink'),
        
        new ButtonBuilder()
          .setLabel('Roblox Group')
          .setStyle(ButtonStyle.Link)
          .setEmoji('<:roblox:YourEmojiID>')
          .setURL('https://www.roblox.com/groups/YourGroupID'),

        new ButtonBuilder()
          .setLabel('Business Permit')
          .setStyle(ButtonStyle.Link)
          .setEmoji('<:permit:YourEmojiID>')
          .setURL('https://link-to-permit.com')
      );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    } catch (error) {
      console.error('❌ Error executing /aboutus:', error);
      await interaction.reply({
        content: 'An error occurred while fetching the about us information.',
        ephemeral: true,
      });
    }
  },
};
