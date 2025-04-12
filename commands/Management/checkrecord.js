const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkrecord')
    .setDescription('Searches a username on the Firestone database and returns their profile, arrest, and citation records.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Please provide the username of the person you are checking.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');

    await interaction.reply({ content: '🔎 Searching the Firestone database...', ephemeral: true });

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.goto('https://database.stateoffirestone.com/', { waitUntil: 'networkidle2' });

      await page.type('input[name="username"]', username);
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ]);

      const data = await page.evaluate(() => {
        const profileImage = document.querySelector('img')?.src || null;
        const profileInfo = document.querySelector('body').innerText.match(/Profile\n([\s\S]*?)\nArrest Record/)?.[1] || 'N/A';
        const arrestRecord = document.querySelector('body').innerText.match(/Arrest Record\n([\s\S]*?)\nCitation Records/)?.[1] || 'N/A';
        const citationRecords = document.querySelector('body').innerText.match(/Citation Records\n([\s\S]*)/)?.[1] || 'N/A';

        return { profileImage, profileInfo, arrestRecord, citationRecords };
      });

      await browser.close();

      const embed = new EmbedBuilder()
        .setTitle(`Firestone Record for ${username}`)
        .setColor(0x00AE86)
        .setThumbnail(data.profileImage)
        .addFields(
          { name: 'Profile', value: data.profileInfo || 'No Profile Information Found' },
          { name: 'Arrest Record', value: data.arrestRecord || 'No Arrest Records Found' },
          { name: 'Citation Records', value: data.citationRecords || 'No Citation Records Found' },
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      await interaction.editReply({ content: '❌ An error occurred while fetching data from the Firestone database.', ephemeral: true });
    }
  },
};
