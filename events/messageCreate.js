const prefix = process.env.PREFIX || '!'; // Update to your prefix

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`❌ Error in prefix command: ${commandName}`, error);

      await message.reply('An error occurred while executing this command.').catch(() => {});
    }
  },
};
