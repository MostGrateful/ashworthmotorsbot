const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const mysql = require('mysql2');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set the business status (open/closed) and update VC'),
  async execute(interaction, db) {
    // Get the business status from the database
    db.query('SELECT * FROM business_status LIMIT 1', (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return interaction.reply({ content: 'An error occurred while fetching business status.', ephemeral: true });
      }

      // If no results exist, initialize the business status
      if (results.length === 0) {
        db.query('INSERT INTO business_status (status) VALUES ("open")', (err) => {
          if (err) {
            console.error('Failed to insert default business status:', err);
            return interaction.reply({ content: 'An error occurred while initializing business status.', ephemeral: true });
          }
          console.log('Business status initialized to open.');
        });
      }

      const status = results[0]?.status || 'open';  // Default to open if no status is set

      // Create buttons to change status
      const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setCustomId('open')
            .setLabel('Open')
            .setStyle('PRIMARY'),
          new MessageButton()
            .setCustomId('closed')
            .setLabel('Closed')
            .setStyle('DANGER')
        );

      // Send a message to the user to select the status
      interaction.reply({
        content: `Current status is: ${status.charAt(0).toUpperCase() + status.slice(1)}. Choose a new status:`,
        components: [row],
      });

      // Set up the interaction collector
      const filter = i => i.user.id === interaction.user.id;  // Ensure only the user who triggered the command can interact

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000, // Collect for 15 seconds
      });

      collector.on('collect', async i => {
        if (i.customId === 'open' || i.customId === 'closed') {
          const newStatus = i.customId;

          // Update the database with the new status
          db.query('UPDATE business_status SET status = ? WHERE id = 1', [newStatus], (err) => {
            if (err) {
              console.error('Failed to update business status:', err);
              return i.reply({ content: 'An error occurred while updating business status.', ephemeral: true });
            }
            console.log(`Business status updated to: ${newStatus}`);
            i.reply(`You've changed the status of the business to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`);
          });

          // Update the voice channel name based on the new status
          const businessStatusChannel = interaction.guild.channels.cache.find(channel => channel.name === 'business-status' && channel.type === 'GUILD_VOICE');
          if (businessStatusChannel) {
            businessStatusChannel.setName(`Track Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`)
              .then(() => console.log(`Updated voice channel name to: Track Status: ${newStatus}`))
              .catch(err => console.error('Failed to update VC name:', err));
          } else {
            console.error('Voice channel "business-status" not found.');
          }
        }
        collector.stop();  // Stop the collector after one interaction
      });

      collector.on('end', () => {
        if (!collector.ended) {
          interaction.editReply({ content: 'The time to change the status has expired.', components: [] });
        }
      });
    });
  },
};

