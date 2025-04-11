const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('record')
    .setDescription('Record staff attendance for a shift.')
    .addStringOption(option =>
      option.setName('shift')
        .setDescription('List usernames separated by commas')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const usernames = interaction.options.getString('shift').split(',').map(name => name.trim());
    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;

    try {
      // Get lists
      const listsResponse = await axios.get(`https://api.trello.com/1/boards/${boardId}/lists`, {
        params: { key: apiKey, token: apiToken }
      });

      const targetList = listsResponse.data.find(list => list.name.toLowerCase() === 'submitted shift logs');

      if (!targetList) {
        return await interaction.editReply('❌ Could not find the "Submitted Shift Logs" list on the board.');
      }

      // Get labels
      const labelsResponse = await axios.get(`https://api.trello.com/1/boards/${boardId}/labels`, {
        params: { key: apiKey, token: apiToken }
      });

      const pendingLabel = labelsResponse.data.find(label => label.name.toLowerCase() === 'pending');

      const createdCards = [];

      for (const username of usernames) {
        const now = new Date();
        const description = `Shift: ${now.toLocaleDateString()} & ${now.toLocaleTimeString()}\nSubmitted by: ${interaction.user.tag}`;

        const cardResponse = await axios.post(`https://api.trello.com/1/cards`, null, {
          params: {
            name: username,
            due: now.toISOString(),
            desc: description,
            idList: targetList.id,
            idLabels: pendingLabel ? pendingLabel.id : undefined,
            key: apiKey,
            token: apiToken
          }
        });

        createdCards.push(`[${username}](${cardResponse.data.url})`);
      }

      await interaction.editReply(`✅ Successfully logged the shift for:\n${createdCards.join('\n')}`);

    } catch (error) {
      console.error('❌ Error creating cards on Trello:', error);
      await interaction.editReply('❌ Failed to log the shift. Please try again later or contact management.');
    }
  },
};
