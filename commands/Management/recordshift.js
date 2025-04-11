const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('record')
    .setDescription('Record system commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('shift')
        .setDescription('Record a shift')
        .addStringOption(option =>
          option
            .setName('users')
            .setDescription('Comma separated list of usernames')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.options.getSubcommand() === 'shift') return;

    await interaction.deferReply({ ephemeral: true });

    const usernames = interaction.options.getString('users').split(',').map(u => u.trim());
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const boardId = process.env.TRELLO_BOARD_ID;
    const apiKey = process.env.TRELLO_API_KEY;
    const apiToken = process.env.TRELLO_API_TOKEN;

    const listName = 'Submitted Shift Logs';

    try {
      // Fetch Lists on Board
      const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${apiToken}`);
      const lists = await listsRes.json();
      const targetList = lists.find(list => list.name === listName);

      if (!targetList) {
        return interaction.editReply('❌ Failed to find the "Submitted Shift Logs" list.');
      }

      const labelRes = await fetch(`https://api.trello.com/1/boards/${boardId}/labels?key=${apiKey}&token=${apiToken}`);
      const labels = await labelRes.json();
      const pendingLabel = labels.find(label => label.name.toLowerCase() === 'pending');

      for (const user of usernames) {
        await fetch(`https://api.trello.com/1/cards?key=${apiKey}&token=${apiToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user,
            desc: `Shift: ${date} & ${time}\nSubmitted by: ${interaction.user.tag}`,
            idList: targetList.id,
            due: now.toISOString(),
            idLabels: pendingLabel ? [pendingLabel.id] : []
          }),
        });
      }

      await interaction.editReply('✅ Shift successfully logged!');
    } catch (error) {
      console.error('Error recording shift:', error);
      await interaction.editReply('❌ An error occurred while recording the shift.');
    }
  },
};
