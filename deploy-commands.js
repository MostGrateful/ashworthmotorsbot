require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Function to recursively read command files from directories
function loadCommands(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      loadCommands(filePath); // Recurse into subdirectory
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      if (command.data && command.execute) {
        commands.push(command.data.toJSON());
      } else {
        console.warn(`The command at ${filePath} is missing "data" or "execute" properties.`);
      }
    }
  }
}

// Load commands from the 'commands' directory
loadCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Register commands globally
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
