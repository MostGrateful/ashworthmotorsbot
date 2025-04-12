const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkblacklist')
    .setDescription('Check if a user is blacklisted on public Trello boards.')
    .addStringOption(option =>
      option.setName('username_id')
        .setDescription('The Username:ID to check (e.g. JohnDoe:1234)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('username_id');
    const results = [];

    await interaction.reply({ content: '🔎 Running blacklist check...', ephemeral: true });

    const docBoardId = 'r4a8Tw1I';
    const doPSBoardId = 'kl3ZKkNr';
    const ignoreLabels = ['Dismissed', 'Denied', 'Voided', 'Appealed', 'Declined'];

    // Search DoC Business Blacklist
    try {
      const docRes = await fetch(`https://trello.com/b/${docBoardId}.json`);
      const docData = await docRes.json();
      const blacklistList = docData.lists.find(l => l.name === 'Business Blacklist');

      if (blacklistList) {
        const cards = docData.cards.filter(c => c.idList === blacklistList.id && c.name.includes(query));
        if (cards.length) {
          results.push({ board: 'DoC', url: `https://trello.com/b/${docBoardId}` });
        }
      }
    } catch (err) {
      console.error('❌ Error checking DoC board:', err);
    }

    // Search DoPS Board
    try {
      const doPSRes = await fetch(`https://trello.com/b/${doPSBoardId}.json`);
      const doPSData = await doPSRes.json();

      const cards = doPSData.cards.filter(c => {
        const hasIgnoredLabel = c.labels.some(l => ignoreLabels.includes(l.name));
        return !hasIgnoredLabel && c.name.includes(query);
      });

      if (cards.length) {
        results.push({ board: 'DoPS', url: `https://trello.com/b/${doPSBoardId}` });
      }
    } catch (err) {
      console.error('❌ Error checking DoPS board:', err);
    }

    // Build Result
    if (!results.length) {
      return interaction.editReply({ content: '✅ Cleared — No active blacklist found.' });
    }

    const embed = new EmbedBuilder()
      .setTitle('Blacklist Results')
      .setDescription(results.map(r => `❌ Match found on [${r.board}](${r.url})`).join('\n'))
      .setColor('Red')
      .setFooter({ text: 'Please verify any matches manually.' });

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};
