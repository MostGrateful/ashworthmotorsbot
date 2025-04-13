const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Displays information about the bot.'),

  async execute(interaction, client) {
    const uptime = Math.floor(client.uptime / 1000);
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const cpuModel = os.cpus()[0].model;

    const embed = new EmbedBuilder()
      .setTitle('Bot Information')
      .addFields(
        { name: 'Bot Tag', value: `${client.user.tag}`, inline: true },
        { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Uptime', value: `<t:${Math.floor(Date.now() / 1000) - uptime}:R>`, inline: true },
        { name: 'Memory Usage', value: `${memoryUsage} MB`, inline: true },
        { name: 'CPU', value: `${cpuModel}`, inline: false },
        { name: 'Commands Loaded', value: `${client.commands.size}`, inline: true },
      )
      .setColor('Blurple')
      .setThumbnail(client.user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};
