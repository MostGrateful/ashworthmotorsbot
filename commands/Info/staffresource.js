const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffresource')
        .setDescription('View resources available for the staff.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Staff Resources')
            .setDescription(`
                As part of the Ashworth Motorsports team, we want to ensure that our staff has all the tools and information they need to provide excellent service and maintain a smooth operation.

                We offer the following resources to our team:

                - **Track Maintenance Guidelines**: Essential procedures for maintaining the track and ensuring the safety of the racers.
                - **Customer Interaction Guidelines**: Best practices for interacting with customers to ensure a positive experience.
                - **Go-Kart Maintenance Instructions**: Detailed instructions for Go-Kart maintenance to keep the vehicles in top racing condition.

                These resources can be accessed through our internal staff portal, and further training materials will be provided for all new team members. We are committed to supporting our staff in every aspect of their role.
            `)
            .setColor('#213567')
            .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
            .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });

        // Send embed in the channel without replying to the interaction
        const channel = interaction.channel;
        if (channel) {
            await channel.send({ embeds: [embed] });
            await interaction.deferReply({ ephemeral: true });
            await interaction.deleteReply(); // Deletes the interaction reply to avoid notifying the user
        }
    },
};
