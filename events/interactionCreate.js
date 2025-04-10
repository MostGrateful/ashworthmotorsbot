module.exports = {
    name: 'interactionCreate',
  
    /**
     * @param {import('discord.js').Interaction} interaction 
     * @param {import('discord.js').Client} client 
     */
    async execute(interaction, client) {
      if (!interaction.isChatInputCommand()) return;
  
      const command = client.commands.get(interaction.commandName);
  
      if (!command) {
        console.error(`❌ No command matching ${interaction.commandName} found.`);
        return;
      }
  
      try {
        await command.execute(interaction, client.db); // Pass the db from client context
      } catch (error) {
        console.error('❌ Error executing command:', error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error executing this command.',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'There was an error executing this command.',
            ephemeral: true,
          });
        }
      }
    }
  };
  