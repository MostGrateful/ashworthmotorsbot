const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkblacklist')
    .setDescription('Check if a user is blacklisted on public Trello boards.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription("Please provide the username of the person you're conducting a blacklist check on.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const username = interaction.options.getString('username');
    const results = [];

    await interaction.reply({ content: '🔎 Searching Trello boards for blacklist records...', ephemeral: true });

    const boards = [
      { id: 'r4a8Tw1I', name: 'DoC', listName: 'Business Blacklist' },
      { id: 'kl3ZKkNr', name: 'DoPS', ignoreLabels: ['Dismissed', 'Denied', 'Voided', 'Appealed', 'Declined'] },
    ];

    for (const board of boards) {
      try {
        const res = await fetch(`https://trello.com/b/${board.id}.json`);
        const data = await res.json();

        // Search every list in the board
        for (const list of data.lists) {
          if (board.listName && list.name !== board.listName) continue;

          const cardsInList = data.cards.filter(card => card.idList === list.id);

          for (const card of cardsInList) {
            const hasIgnoredLabel = card.labels?.some(label => board.ignoreLabels?.includes(label.name));

            if (hasIgnoredLabel) continue;
            if (card.name.toLowerCase().includes(username.toLowerCase())) {
              const link = `https://trello.com/c/${card.shortLink}`;
              results.push(`[${card.name}] - ${board.name}: ${link}`);
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error checking ${board.name} board:`, error);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`Blacklist Results for "${username}"`)
      .setColor(results.length ? 0xff0000 : 0x00ff00)
      .setDescription(
        results.length
          ? results.join('\n')
          : '✅ No records found for this user.'
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
