const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkrecord')
    .setDescription('Search a username on the Firestone database for profile, arrests, and citations.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Please provide the username of the person you are checking.')
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

        const extract = (start, end) => {
          const pattern = new RegExp(`${start}[\\s\\S]*?${end}`, 'i');
          const match = text.match(pattern);
          return match ? match[0].replace(start, '').replace(end, '').trim() : 'No Data Found';
        };

        return {
          profileImage,
          profile: extract('Profile', 'Callsigns'),
          callsigns: extract('Callsigns', 'Paintball Tournament Statistics'),
          paintball: extract('Paintball Tournament Statistics', 'Vehicles'),
          vehicles: extract('Vehicles', 'Arrest Record'),
          arrests: extract('Arrest Record', 'Citation Records'),
          citations: extract('Citation Records', 'Terms')
        };
      });

      await browser.close();

      const embeds = category => {
        return new EmbedBuilder()
          .setTitle(`${category} for ${username}`)
          .setDescription(data[category.toLowerCase()] || 'No Data Found')
          .setThumbnail(data.profileImage)
          .setColor('Blurple')
          .setFooter({
            text: 'The source of this information comes from the **[Firestone Database](https://database.stateoffirestone.com/)**',
            iconURL: 'https://images-ext-1.discordapp.net/external/F9kGNa5k1MZU3TZJ1q4AOKL3m2JNUCFZQO-piZHTkGw/https/database.stateoffirestone.com/img/FS_Database.png?format=webp&quality=lossless&width=1860&height=239',
          });
      };

      const categories = ['Profile', 'Callsigns', 'Paintball', 'Vehicles', 'Arrests', 'Citations'];

      let currentCategory = 0;

      const categoryButtons = new ActionRowBuilder().addComponents(
        categories.map((c, i) =>
          new ButtonBuilder()
            .setCustomId(`cat_${i}`)
            .setLabel(c)
            .setStyle(ButtonStyle.Primary)
        )
      );

      const msg = await interaction.editReply({
        embeds: [embeds(categories[currentCategory])],
        components: [categoryButtons],
      });

      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000,
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id)
          return await i.reply({ content: 'This interaction is not for you!', ephemeral: true });

        const chosenCategory = parseInt(i.customId.split('_')[1]);

        currentCategory = chosenCategory;

        await i.update({
          embeds: [embeds(categories[currentCategory])],
          components: [categoryButtons],
        });
      });

      collector.on('end', async () => {
        await msg.edit({ components: [] });
      });

    } catch (error) {
      console.error('❌ Error:', error);
      await browser.close();
      await interaction.editReply({
        content: 'An error occurred while fetching the user data.',
        ephemeral: true,
      });
    }
  },
};
