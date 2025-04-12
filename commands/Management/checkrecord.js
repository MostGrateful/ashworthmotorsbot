const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkrecord')
    .setDescription('Search a username on the Firestone database for their records.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Background Check')
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
        const robloxIdMatch = text.match(/Roblox ID:\s(\d+)/);
        const robloxId = robloxIdMatch ? robloxIdMatch[1] : null;
        const extract = (start, end) => {
          const pattern = new RegExp(`${start}[\\s\\S]*?${end}`, 'i');
          const match = text.match(pattern);
          return match ? match[0].replace(start, '').replace(end, '').trim() : '';
        };
        return {
          robloxId,
          profile: extract('Profile', 'Callsigns'),
          arrests: extract('Arrest Record', 'Citation Records'),
          citations: extract('Citation Records', 'Terms')
        };
      });

      await browser.close();

      const footerText = 'Source of this information comes from the Firestone Database';
      const footerImage = 'https://images-ext-1.discordapp.net/external/F9kGNa5k1MZU3TZJ1q4AOKL3m2JNUCFZQO-piZHTkGw/https/database.stateoffirestone.com/img/FS_Database.png?format=webp&quality=lossless&width=1860&height=239';
      const avatarURL = data.robloxId ? `https://www.roblox.com/headshot-thumbnail/image?userId=${data.robloxId}&width=420&height=420&format=png` : null;

      const formatRecords = (records) => {
        if (!records || records.includes('No data available in table')) return 'No current record.';
        return records
          .split('\n')
          .filter(line => line.includes('-'))
          .map(line => `• ${line.trim()}`)
          .join('\n') || 'No current record.';
      };

      const buildEmbed = (title, content) => new EmbedBuilder()
        .setTitle(`${title} for ${username}`)
        .setDescription(content)
        .setThumbnail(avatarURL)
        .setColor('Blurple')
        .setFooter({ text: footerText, iconURL: footerImage });

      const categories = ['Profile', 'Certifications', 'Arrest Record', 'Citation Record', 'Blacklist'];
      const contentData = [
        data.profile || 'No Data Found.',
        'Coming Soon.',
        formatRecords(data.arrests),
        formatRecords(data.citations)
      ];

      const checkBoard = async (boardId) => {
        const response = await fetch(`https://trello.com/b/${boardId}.json`);
        if (!response.ok) return 'None';
        const json = await response.json();
        const cards = json.cards || [];
        const card = cards.find(c => c.name.toLowerCase().includes(username.toLowerCase()));
        if (!card) return 'None';
        const hasIgnored = (card.labels || []).some(label =>
          ['Dismissed', 'Denied', 'Voided', 'Appealed', 'Declined'].includes(label.name)
        );
        return hasIgnored ? 'None' : '✅ Active';
      };

      const getBlacklistStatus = async () => {
        const dops = await checkBoard('kl3ZKkNr');
        const doc = await checkBoard('r4a8Tw1I');

        return new EmbedBuilder()
          .setTitle(`${username} - Blacklist Status`)
          .setDescription(`__**Ashworth Motorsports**__\nStatus: N/A\n\n__**Public Safety (DoPS)**__\nStatus: ${dops}\n\n__**Department of Commerce (DoC)**__\nStatus: ${doc}`)
          .setThumbnail(avatarURL)
          .setColor('Blurple')
          .setFooter({ text: footerText, iconURL: footerImage });
      };

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

        if (!i.deferred && !i.replied) {
          await i.deferUpdate().catch(() => {});
        }

        currentCategory = parseInt(i.customId.split('_')[1]);

        const embed = currentCategory === 4
          ? await getBlacklistStatus()
          : buildEmbed(categories[currentCategory], contentData[currentCategory]);

        await i.editReply({ embeds: [embed], components: [row] }).catch(() => {});
      });

      collector.on('end', async () => {
        if (msg.editable) {
          await msg.edit({ components: [] }).catch(() => {});
        }

        // Logging usage
        const logChannel = interaction.guild.channels.cache.get('1354669298060365884');

        if (logChannel && logChannel.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setTitle('CheckRecord Command Used')
            .addFields(
              { name: 'Command Used By', value: `${interaction.user.tag} (${interaction.user.id})` },
              { name: 'Target Username', value: username }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor('DarkBlue')
            .setFooter({ text: `Logged at ${new Date().toLocaleString()}` });

          await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      });

    } catch (error) {
      console.error('❌ Error:', error);
      await browser.close();
      await interaction.editReply({ content: 'An error occurred while fetching the user data.', flags: 64 });
    }
  },
};
