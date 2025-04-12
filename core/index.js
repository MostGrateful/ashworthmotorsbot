require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const db = require('./db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();
client.db = db;

// Load Commands Dynamically
const commands = [];
const commandsPath = path.join(__dirname, '../commands');

for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.lstatSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
  }
}

// Deploy Commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    console.log(`🔄 Reloading ${commands.length} application (/) commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered successfully.');
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }
})();

// Load Events
const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.name && event.execute) {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

