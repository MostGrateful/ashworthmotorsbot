const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Owner Only - Reloads a command without restarting the bot.')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The name of the command to reload')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const allowedUsers = ['238058962711216130']; // Your User ID here
    const commandName = interaction.options.getString('command').toLowerCase();

    if (!allowedUsers.includes(interaction.user.id)) {
      return await interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
    }

    const command = client.commands.get(commandName);

    if (!command) {
      return await interaction.reply({ content: `❌ Command \`${commandName}\` not found.`, ephemeral: true });
    }

    try {
      // Find command file path
      let commandPath;
      const commandsPath = path.join(__dirname, '..', '..', 'commands');

      for (const folder of fs.readdirSync(commandsPath)) {
        const folderPath = path.join(commandsPath, folder);
        const commandFilePath = path.join(folderPath, `${commandName}.js`);
        if (fs.existsSync(commandFilePath)) {
          commandPath = commandFilePath;
          break;
        }
      }

      if (!commandPath) {
        return await interaction.reply({ content: '❌ Command file not found.', ephemeral: true });
      }

      // Reload the command
      delete require.cache[require.resolve(commandPath)];
      const newCommand = require(commandPath);

      client.commands.set(newCommand.data.name, newCommand);

      await interaction.reply({ content: `✅ Command \`${commandName}\` reloaded successfully.`, ephemeral: true });

    } catch (error) {
      console.error(`❌ Error reloading ${commandName}:`, error);
      await interaction.reply({ content: `An error occurred while reloading \`${commandName}\`.`, ephemeral: true });
    }
  },
};
