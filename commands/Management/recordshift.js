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
            .setDescription('List all usernames separated by a comma (No Spaces)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('host')
            .setDescription('Who hosted the shift')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('datetime')
            .setDescription('Date & Time of the shift')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'shift') {
      await interaction.deferReply({ ephemeral: true });

      const usersInput = interaction.options.getString('users');
      const host = interaction.options.getString('host');
      const dateTime = interaction.options.getString('datetime');
      const usernames = usersInput.split(',').map(u => u.trim()).filter(Boolean);

      if (usernames.length === 0) {
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
          const description = `# Shift Log\nHosted by: ${host}\nDate & Time: ${dateTime}\n---\nShift Logged by: ${interaction.user.tag}\nDate & Time: ${now}\n---\nReviewed & Approved by: \nDate & Time: `;

          const card = await TrelloAPI.createCard(
            targetList.id,
            username,
            description
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
