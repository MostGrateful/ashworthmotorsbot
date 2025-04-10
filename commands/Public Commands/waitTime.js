const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('waittime')
        .setDescription('Set or view the current wait time.')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Set the wait time in minutes.')
                .setRequired(false)),

    async execute(interaction) {
        const waitTime = interaction.options.getInteger('time');

        // Assuming db is passed in a higher scope or integrated into your bot logic
        const db = interaction.client.db;

        // Check business status from the database
        db.query('SELECT status, wait_time FROM business WHERE id = 1', (err, results) => {
            if (err) {
                console.error('Error fetching business status:', err);
                return interaction.reply('There was an error fetching the business status.');
            }

            const businessStatus = results[0]?.status; // Assuming only one row exists
            const currentWaitTime = results[0]?.wait_time || 0; // Default to 0 if not set

            // If the business is closed, prevent modification of the wait time
            if (businessStatus === 'closed') {
                return interaction.reply('The business is currently closed. You cannot modify the wait time.');
            }

            // If the business is open, allow wait time modification
            if (waitTime !== null) {
                // If no wait time is provided, we set the default to 0 when the business is open
                const newWaitTime = waitTime !== undefined ? waitTime : 0;

                db.query('UPDATE business SET wait_time = ? WHERE id = 1', [newWaitTime], (err, results) => {
                    if (err) {
                        console.error('Error updating wait time:', err);
                        return interaction.reply('There was an error updating the wait time.');
                    }

                    return interaction.reply(`The wait time has been set to ${newWaitTime} minutes.`);
                });
            } else {
                // If no time is provided, show the current wait time
                return interaction.reply(`The current wait time is ${currentWaitTime} minutes.`);
            }
        });
    },
};


