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

    await interaction.reply({ content: '🔍 Running a blacklist check...', ephemeral: true });

    // Check DoC board (only "Business Blacklist" list)
    const docBoardId = 'r4a8Tw1I';
    const docListName = 'Business Blacklist';
    try {
      const docLists = await fetch(`https://api.trello.com/1/boards/${docBoardId}/lists`).then(res => res.json());
      const blacklistList = docLists.find(l => l.name === docListName);
      if (blacklistList) {
        const cards = await fetch(`https://api.trello.com/1/lists/${blacklistList.id}/cards`).then(res => res.json());
        const match = cards.find(card => card.name.includes(query));
        if (match) {
          results.push({ board: 'DoC', url: `https://trello.com/b/${docBoardId}` });
        }
      }
    } catch (err) {
      console.error('Error checking DoC board:', err);
    }

    // Check DoPS board (ignore certain labels)
    const doPSBoardId = 'kl3ZKkNr';
    const ignoreLabels = ['Dismissed', 'Denied', 'Voided', 'Appealed'];

    try {
      const cards = await fetch(`https://api.trello.com/1/boards/${doPSBoardId}/cards`).then(res => res.json());
      for (const card of cards) {
        const hasIgnoredLabel = card.labels.some(label => ignoreLabels.includes(label.name));
        if (!hasIgnoredLabel && card.name.includes(query)) {
          results.push({ board: 'DoPS', url: `https://trello.com/b/${doPSBoardId}` });
          break;
        }
      }
    } catch (err) {
      console.error('Error checking DoPS board:', err);
    }

    // Format response
    if (results.length === 0) {
      return interaction.editReply({ content: '✅ Cleared, no active blacklist.' });
    }

    const embed = new EmbedBuilder()
      .setTitle('Blacklist Check')
      .setDescription(results.map(r => `❌ Failed, the user has a blacklist on [${r.board}](${r.url})`).join('\n'))
      .setColor('Red')
      .setFooter({ text: 'Any failed results should be checked and verified' });

    await interaction.editReply({ content: '', embeds: [embed] });
  }
};
