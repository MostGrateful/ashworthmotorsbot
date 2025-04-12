const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recordshift')
    .setDescription('Record a shift log to Trello.')
    .addStringOption(option =>
      option.setName('host')
        .setDescription('Shift Host')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Date & Time of Shift')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('users')
        .setDescription('Usernames (comma-separated)')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const host = interaction.options.getString('host');
    const time = interaction.options.getString('time');
    const usersRaw = interaction.options.getString('users');

    const users = usersRaw.split(',').map(user => user.trim());

    const trelloKey = process.env.TRELLO_API_KEY;
    const trelloToken = process.env.TRELLO_API_TOKEN;
    const listId = process.env.TRELLO_LIST_ID; // Submitted Shift Logs List

    try {
      await interaction.deferReply({ ephemeral: true });

      for (const user of users) {
        const description = `# Shift Log
_________________
### Hosted by: ${host}
### Date & Time: ${time}
Shift Logged by: ${interaction.user.tag}
_________________
Reviewed & Approved by: 
Date & Time: `;

        await axios.post(`https://api.trello.com/1/cards`, null, {
          params: {
            name: user,
            desc: description,
            idList: listId,
            key: trelloKey,
            token: trelloToken,
          },
        });
      }

      await interaction.editReply({
        content: `Successfully recorded shift log for: ${users.join(', ')}`,
      });

    } catch (error) {
      console.error('❌ Error executing /recordshift:', error);
      await interaction.editReply({
        content: 'An error occurred while recording the shift log.',
      });
    }
  },
};