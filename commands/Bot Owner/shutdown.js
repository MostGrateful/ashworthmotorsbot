const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Shutdown the bot safely.'),
  
  async execute(interaction, client) {
    // Only allow bot owner to shutdown the bot
    if (interaction.user.id !== process.env.BOT_OWNER_ID) {
      return interaction.reply({
        content: 'You do not have permission to shut down the bot.',
        ephemeral: true,
      });
    }

    // Send confirmation message with a button to confirm shutdown
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('confirm_shutdown')
          .setLabel('Confirm Shutdown')
          .setStyle('DANGER')
      );

    await interaction.reply({
      content: 'Are you sure you want to shut down the bot? Click below to confirm.',
      components: [row],
    });

    // Set up the interaction collector
    const filter = i => i.user.id === interaction.user.id && i.customId === 'confirm_shutdown'; // Ensure only the user who triggered the shutdown can confirm

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 30000, // 30 seconds to confirm
    });

    collector.on('collect', async i => {
      // Confirm shutdown and safely exit
      await i.update({ content: 'Shutting down the bot...', components: [] });

      // Clean up any necessary processes or connections before shutdown (e.g., database connections)
      console.log('Shutting down the bot...');

      // Close any open connections if necessary (e.g., MySQL)
      client.destroy();  // Close the Discord client connection

      process.exit(0);  // Exit the process with success
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({
          content: 'Shutdown request timed out. No action taken.',
          components: [],
        });
      }
    });
  },
};

