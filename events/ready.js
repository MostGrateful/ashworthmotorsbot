module.exports = {
  name: 'ready',
  once: true, // Runs only once

  async execute(client) {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
  },
};
