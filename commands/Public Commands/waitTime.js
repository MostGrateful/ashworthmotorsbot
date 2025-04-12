const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('waittime')
    .setDescription('View or set the current wait time.')
    .addStringOption(option =>
      option.setName('set')
        .setDescription('Set a new wait time')
    ),

  async execute(interaction, client) {
    const db = client.db;
    const waitTimeOption = interaction.options.getString('set');

    try {
      // If no wait time provided -> Display current wait time
      if (!waitTimeOption) {
        const [rows] = await db.query('SELECT wait_time FROM settings WHERE id = 1');

        if (!rows.length) {
          return await interaction.reply({ content: 'Wait time is not set.', ephemeral: true });
        }

        return await interaction.reply({ content: `Current Wait Time: ${rows[0].wait_time}`, ephemeral: true });
      }

      // Update wait time
      await db.query('UPDATE settings SET wait_time = ? WHERE id = 1', [waitTimeOption]);

      await interaction.reply({ content: `Successfully updated wait time to: ${waitTimeOption}`, ephemeral: true });

    } catch (error) {
      console.error(`❌ Error in /waittime:`, error);
      await interaction.reply({ content: 'An unexpected error occurred while processing the wait time.', ephemeral: true });
    }
  },
};


