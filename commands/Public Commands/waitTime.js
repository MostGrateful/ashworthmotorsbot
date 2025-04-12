const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waittime')
    .setDescription('View or set wait time.')
    .addStringOption(option =>
      option.setName('set')
        .setDescription('Set a new wait time')
    ),

  async execute(interaction, client) {
    const db = client.db;

    const waitTimeOption = interaction.options.getString('set');

    try {
      if (!waitTimeOption) {
        const [rows] = await db.query('SELECT wait_time FROM settings WHERE id = 1');
        return await interaction.reply({
          content: `Current Wait Time: ${rows[0].wait_time}`,
          ephemeral: true,
        });
      }

      await db.query('UPDATE settings SET wait_time = ? WHERE id = 1', [waitTimeOption]);
      await interaction.reply({
        content: `Wait time updated to: ${waitTimeOption}`,
        ephemeral: true,
      });

    } catch (error) {
      console.error('❌ Error executing /waittime:', error);
      await interaction.reply({
        content: 'An error occurred while updating the wait time.',
        ephemeral: true,
      });
    }
  },
};


