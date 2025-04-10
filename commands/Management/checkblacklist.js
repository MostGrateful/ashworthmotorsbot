const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkblacklist')
    .setDescription('Check if a user is blacklisted on DoC or DoPS')
    .addStringOption(option =>
      option.setName('usernameid')
        .setDescription('Provide the Username:ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const usernameId = interaction.options.getString('usernameid');
    const usernameOnly = usernameId.split(':')[0].toLowerCase();

    await interaction.deferReply({ ephemeral: true });

    const results = [];

    const docBoardId = 'r4a8Tw1I'; // DoC
    const dopsBoardId = 'kl3ZKkNr'; // DoPS

    try {
      // DoC Search
      const docLists = await fetch(`https://api.trello.com/1/boards/${docBoardId}/lists`).then(res => res.json());
      const blacklistList = docLists.find(list => list.name.toLowerCase() === 'business blacklist');

      if (blacklistList) {
        const docCards = await fetch(`https://api.trello.com/1/lists/${blacklistList.id}/cards`).then(res => res.json());

        const foundDocCards = docCards.filter(card =>
          card.name.toLowerCase().includes(usernameId.toLowerCase())
        );

        if (foundDocCards.length) {
          results.push({
            board: `[DoC](https://trello.com/b/${docBoardId})`,
            cards: foundDocCards.map(card => `- [${card.name}](${card.shortUrl})`),
          });
        }
      }
    } catch (error) {
      console.error('Error checking DoC board:', error);
    }

    try {
      // DoPS Search
      const dopsCards = await fetch(`https://api.trello.com/1/boards/${dopsBoardId}/cards`).then(res => res.json());

      const ignoreLabels = ['Dismissed', 'Denied', 'Voided', 'Appealed', 'Declined'];

      const foundDopsCards = dopsCards.filter(card =>
        card.name.toLowerCase().includes(usernameOnly) &&
        !card.labels.some(label => ignoreLabels.includes(label.name))
      );

      if (foundDopsCards.length) {
        results.push({
          board: `[DoPS](https://trello.com/b/${dopsBoardId})`,
          cards: foundDopsCards.map(card => `- [${card.name}](${card.shortUrl})`),
        });
      }
    } catch (error) {
      console.error('Error checking DoPS board:', error);
    }

    const embed = new EmbedBuilder()
      .setTitle('Blacklist Check Results')
      .setColor(results.length ? 'Red' : 'Green')
      .setFooter({ text: 'Any failed results should be checked and verified' });

    if (results.length) {
      results.forEach(result => {
        embed.addFields({
          name: result.board,
          value: result.cards.join('\n'),
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply({ content: 'Cleared, no active blacklist.' });
    }
  },
};
