const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkblacklist')
    .setDescription('Check if a user is blacklisted.')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('Enter Username:ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userInput = interaction.options.getString('user');
    const [username] = userInput.split(':'); // Only check username on DoPS

    await interaction.deferReply({ flags: 64 }); // Private reply, flags is the modern ephemeral

    const results = [];

    // DoC Board
    try {
      const docResponse = await fetch('https://api.trello.com/1/boards/r4a8Tw1I/lists?cards=open&card_fields=name');
      const docLists = await docResponse.json();

      const blacklistList = docLists.find(list => list.name === 'Business Blacklist');

      if (blacklistList && blacklistList.cards.some(card => card.name.toLowerCase().includes(userInput.toLowerCase()))) {
        results.push('[DoC](https://trello.com/b/r4a8Tw1I)');
      }
    } catch (err) {
      console.error('Error checking DoC board:', err);
    }

    // DoPS Board
    try {
      const dopsResponse = await fetch('https://api.trello.com/1/boards/kl3ZKkNr/cards?fields=name,labels');
      const dopsCards = await dopsResponse.json();

      const ignoredLabels = ['Dismissed', 'Denied', 'Voided', 'Appealed'];

      const match = dopsCards.find(card =>
        card.name.toLowerCase().includes(username.toLowerCase()) &&
        !card.labels.some(label => ignoredLabels.includes(label.name))
      );

      if (match) {
        results.push('[DoPS](https://trello.com/b/kl3ZKkNr)');
      }
    } catch (err) {
      console.error('Error checking DoPS board:', err);
    }

    const embed = new EmbedBuilder()
      .setColor(results.length > 0 ? 'Red' : 'Green')
      .setTitle(results.length > 0 ? 'Failed, the user has a blacklist on:' : 'Cleared, no active blacklist.')
      .setDescription(results.length > 0 ? results.join(' | ') : 'Nothing found across DoC & DoPS.')
      .setFooter({ text: 'Any failed results should be checked and verified.' });

    await interaction.editReply({ embeds: [embed] });
  },
};
