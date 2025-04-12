module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error in /${interaction.commandName}:`, error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'An unexpected error occurred. Please contact management.',
          ephemeral: true,
        }).catch(() => {});
      } else {
        await interaction.reply({
          content: 'An unexpected error occurred. Please contact management.',
          ephemeral: true,
        }).catch(() => {});
      }
    }
  },
};

