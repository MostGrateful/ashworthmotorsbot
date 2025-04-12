require('dotenv').config();
const { REST, Routes } = require('discord.js');
const path = require('path');
const loadCommands = require('./loadCommands');

const commands = [];
const fakeClient = { commands: new Map() };

loadCommands(path.join(__dirname, '../commands'), commands, fakeClient);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('✅ Successfully registered application (/) commands.');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();
