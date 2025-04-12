const { SlashCommandBuilder } = require('discord.js');
const TrelloAPI = require('../../utils/TrelloAPI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('record')
    .setDescription('Record shifts or other logs')
    .addSubcommand(sub =>
      sub.setName('shift')
        .setDescription('Record a shift')
        .addStringOption(option =>
          option.setName('users')
            .setDescription('List all usernames separated by a comma (no spaces)')
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'shift') {
      await interaction.deferReply({ flags: 64 });

      const usersInput = interaction.options.getString('users');
      const usernames = usersInput.split(',').map(u => u.trim()).filter(Boolean);

      if (!usernames.length) {
        return interaction.editReply('❌ No valid usernames provided.');
      }

      try {
        const lists = await TrelloAPI.getListsOnBoard(process.env.TRELLO_BOARD_ID);
        const targetList = lists.find(list => list.name.toLowerCase() === 'submitted shift logs');

        if (!targetList) {
          return interaction.editReply('❌ Could not find "Submitted Shift Logs" list.');
        }

        const labels = await TrelloAPI.getLabelsOnBoard(process.env.TRELLO_BOARD_ID);
        const pendingLabel = labels.find(label => label.name.toLowerCase() === 'pending');

        const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

        for (const username of usernames) {
          const card = await TrelloAPI.createCard(
            targetList.id,
            username,
            `Shift: ${now}\nSubmitted by: ${interaction.user.tag}`,
            new Date()
          );

          if (pendingLabel) {
            await TrelloAPI.addLabelToCard(card.id, pendingLabel.id);
          }
        }

        await interaction.editReply(`✅ Shift successfully recorded for: ${usernames.join(', ')}`);
      } catch (error) {
        console.error('❌ Error recording shift:', error);
        await interaction.editReply('❌ There was an error while recording the shift. Please try again later.');
      }
    }
  },
};
