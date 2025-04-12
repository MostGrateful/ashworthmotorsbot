const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkblacklist')
    .setDescription('Check if a user is blacklisted on DoC or DoPS Trello boards.')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Enter username:ID')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const userInput = interaction.options.getString('user');

    const trelloKey = process.env.TRELLO_KEY;
    const trelloToken = process.env.TRELLO_TOKEN;

    const docBoardId = 'r4a8Tw1I';
    const dopsBoardId = 'kl3ZKkNr';

    try {
      await interaction.deferReply({ ephemeral: true });

      // Function to search a board
      const searchBoard = async (boardId, listName, labelsToIgnore = []) => {
        const listsRes = await axios.get(`https://api.trello.com/1/boards/${boardId}/lists?key=${trelloKey}&token=${trelloToken}`);
        const list = listsRes.data.find(l => l.name === listName);
        if (!list) return [];

        const cardsRes = await axios.get(`https://api.trello.com/1/lists/${list.id}/cards?key=${trelloKey}&token=${trelloToken}`);
        return cardsRes.data.filter(card => {
          const ignore = card.labels.some(label => labelsToIgnore.includes(label.name));
          return !ignore && card.name.includes(userInput);
        });
      };

      const docResults = await searchBoard(docBoardId, 'Business Blacklist');
      const dopsResults = await searchBoard(dopsBoardId, 'Blacklist', ['Dismissed', 'Denied', 'Voided', 'Appealed', 'Declined']);

      const embed = new EmbedBuilder()
        .setTitle(`Blacklist Results for ${userInput}`)
        .setColor(docResults.length || dopsResults.length ? 0xff0000 : 0x00ff00)
        .setDescription(
          (!docResults.length && !dopsResults.length)
            ? 'No results found.'
            : 'Results from DoC and DoPS boards:'
        );

      if (docResults.length) {
        embed.addFields({
          name: 'DoC Board Matches',
          value: docResults.map(card => `[${card.name}](${card.shortUrl})`).join('\n').slice(0, 1024)
        });
      }

      if (dopsResults.length) {
        embed.addFields({
          name: 'DoPS Board Matches',
          value: dopsResults.map(card => `[${card.name}](${card.shortUrl})`).join('\n').slice(0, 1024)
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('❌ Error checking blacklist:', error);
      await interaction.editReply({
        content: 'An error occurred while checking the blacklist.',
      });
    }
  },
};
