const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkrecord')
    .setDescription('Search a username on the Firestone database for profile, arrests, citations, and blacklist.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Please provide the username of the person you are checking.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');

    await interaction.reply({ content: 'Searching the Firestone database...', flags: 64 });

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
          return match ? match[0].replace(start, '').replace(end, '').trim() : '';
        };

        return {
          profileImage,
          profile: extract('Profile', 'Callsigns'),
          arrests: extract('Arrest Record', 'Citation Records'),
          citations: extract('Citation Records', 'Terms')
        };
      });

      await browser.close();

      const footerText = '**The source of this information comes from the Firestone Database**';
      const footerImage = 'https://images-ext-1.discordapp.net/external/F9kGNa5k1MZU3TZJ1q4AOKL3m2JNUCFZQO-piZHTkGw/https/database.stateoffirestone.com/img/FS_Database.png?format=webp&quality=lossless&width=1860&height=239';

      const cleanList = (input) => {
        if (!input || input.length < 10) return 'No current record found.';
        return input.split('\n').map(line => `• ${line}`).join('\n');
      };

      const buildEmbed = (title, content) => new EmbedBuilder()
        .setTitle(`${title} for ${username}`)
        .setDescription(content)
        .setThumbnail(data.profileImage)
        .setColor('Blurple')
        .setFooter({ text: footerText, iconURL: footerImage });

      const getBlacklistStatus = async () => {
        const ignoredLabels = ['Dismissed', 'Denied', 'Voided', 'Appealed', 'Declined'];
        const checkBoard = async (boardId) => {
          const url = `https://api.trello.com/1/boards/${boardId}/cards?key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`;
          const cards = await fetch(url).then(r => r.json());
          const card = cards.find(c => c.name.toLowerCase().includes(username.toLowerCase()));
          if (!card) return 'None';
          const hasIgnored = card.labels.some(label => ignoredLabels.includes(label.name));
          return hasIgnored ? 'None' : '✅ Active';
        };

        const dops = await checkBoard('kl3ZKkNr');
        const doc = await checkBoard('r4a8Tw1I');

        return new EmbedBuilder()
          .setTitle(`${username} - Blacklist Status`)
          .setDescription(`__**Ashworth Motorsports**__\nStatus: N/A\n\n__**Public Safety (DoPS)**__\nStatus: ${dops}\n\n__**Department of Commerce (DoC)**__\nStatus: ${doc}`)
          .setThumbnail(data.profileImage)
          .setColor('Blurple')
          .setFooter({ text: footerText, iconURL: footerImage });
      };

      const categories = ['Profile', 'Certifications', 'Arrest Record', 'Citation Record', 'Blacklist'];
      const contentData = [
        data.profile || 'No Data Found.',
        'Coming Soon.',
        cleanList(data.arrests),
        cleanList(data.citations)
      ];

      const categoryButtons = categories.map((c, i) =>
        new ButtonBuilder()
          .setCustomId(`cat_${i}`)
          .setLabel(c)
          .setStyle(ButtonStyle.Primary)
      );

      const row = new ActionRowBuilder().addComponents(categoryButtons);

      let currentCategory = 0;

      const msg = await interaction.editReply({
        embeds: [buildEmbed(categories[currentCategory], contentData[currentCategory])],
        components: [row],
      });

      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000,
      });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id)
          return await i.reply({ content: 'This interaction is not for you!', ephemeral: true });

        currentCategory = parseInt(i.customId.split('_')[1]);

        const embed = currentCategory === 4
          ? await getBlacklistStatus()
          : buildEmbed(categories[currentCategory], contentData[currentCategory]);

        await i.update({
          embeds: [embed],
          components: [row],
        });
      });

      collector.on('end', async () => {
        await msg.edit({ components: [] });
      });

    } catch (error) {
      console.error('❌ Error:', error);
      await browser.close();
      await interaction.editReply({ content: 'An error occurred while fetching the user data.', flags: 64 });
    }
  },
};
