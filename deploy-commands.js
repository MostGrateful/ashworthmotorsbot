require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

// Load environment variables
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Load all commands from nested folders inside commands/
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  for (const file of fs.readdirSync(folderPath)) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[⚠️] Skipping ${filePath} — missing "data" or "execute"`);
    }
  }
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Deploying ${commands.length} guild (/) commands to GUILD_ID: ${GUILD_ID}`);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded guild slash commands.');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
