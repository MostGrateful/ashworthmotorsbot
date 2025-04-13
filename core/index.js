require('dotenv').config();
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const logger = require('../utils/logger');
const loadCommands = require('./loadCommands');
const { updateStatus } = require('../utils/statuspage'); // Statuspage Integration

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();
client.db = db;
client.utils = { log: logger.log }; // Auto Logger Ready!

const commands = [];

// Dynamically Load Commands
loadCommands(path.join(__dirname, '../commands'), commands, client);

// Register Commands to Discord API
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Refreshing ${commands.length} application (/) commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log('✅ Successfully registered application (/) commands.');
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }
})();

// Load Events
const eventsPath = path.join(__dirname, '../events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.name && event.execute) {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once('ready', async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  await updateStatus('operational'); // Set Bot to Operational
});

client.login(process.env.DISCORD_TOKEN);

// Handle Errors & Update Statuspage Automatically
process.on('unhandledRejection', async error => {
  console.error('❌ Unhandled Promise Rejection:', error);
  await updateStatus('major_outage');
});

process.on('uncaughtException', async error => {
  console.error('❌ Uncaught Exception:', error);
  await updateStatus('major_outage');
});
