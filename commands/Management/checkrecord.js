const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkrecord')
    .setDescription('Search a username on the Firestone database for profile, arrests, and citations.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to search for.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');

    await interaction.reply({ content: 'Searching the Firestone database...', ephemeral: true });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto('https://database.stateoffirestone.com/', { waitUntil: 'networkidle2' });
      await page.type('input[name="username"]', username);
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ]);

      const data = await page.evaluate(() => {
        const text = document.body.innerText;
        const profileImage = document.querySelector('img')?.src || null;

        const getSection = (start, end) => {
          const regex = new RegExp(`${start}[\\s\\S]*?${end}`, 'i');
          const match = text.match(regex);
          return match ? match[0].replace(start, '').replace(end, '').trim() : 'No Data Found';
        };

        return {
          profileImage,
          profile: getSection('Profile', 'Arrest Record'),
          arrests: getSection('Arrest Record', 'Citation Records'),
          citations: getSection('Citation Records', 'Terms'),
        };
      });

      await browser.close();

      const embeds = [
        new EmbedBuilder().setTitle(`Profile for ${username}`).setDescription(data.profile).setThumbnail(data.profileImage).setColor('Blue'),
        new EmbedBuilder().setTitle(`Arrest Record`).setDescription(data.arrests).setColor('Red'),
        new EmbedBuilder().setTitle(`Citation Record`).setDescription(data.citations).setColor('Orange')
      ];

      let pageIndex = 0;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('back').setLabel('Back').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary)
      );

      const message = await interaction.editReply({ embeds: [embeds[pageIndex]], components: [row] });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) return await i.reply({ content: 'This interaction isn\'t for you!', ephemeral: true });

        if (i.customId === 'back') pageIndex--;
        if (i.customId === 'next') pageIndex++;

        await i.update({
          embeds: [embeds[pageIndex]],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('back').setLabel('Back').setStyle(ButtonStyle.Secondary).setDisabled(pageIndex === 0),
              new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(pageIndex === embeds.length - 1)
            )
          ]
        });
      });

      collector.on('end', async () => {
        await message.edit({ components: [] });
      });

    } catch (error) {
      console.error('❌ Error fetching checkrecord data:', error);
      await browser.close();
      await interaction.editReply({ content: 'An error occurred while fetching the record.', ephemeral: true });
    }
  },
};
