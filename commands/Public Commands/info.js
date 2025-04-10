const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get information about us.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Select the info you want')
                .setRequired(true)
                .addChoices(
                    { name: 'About Us', value: 'about-us' },
                    { name: 'Our Hours', value: 'our-hours' },
                    { name: 'Race with Us', value: 'race-with-us' },
                    { name: 'Safety Statement', value: 'safety-statement' }
                )
        ),

    async execute(interaction) {
        const type = interaction.options.getString('type');
        let embed;

        // Handle the user input and set the corresponding embed
        switch (type) {
            case 'about-us':
                embed = new EmbedBuilder()
                    .setTitle('About Us')
                    .setDescription(`
                        Welcome to Ashworth Motorsports, where speed, thrill, and fun collide! Located in the dynamic world of Firestone, we specialize in offering the most exciting and exhilarating Go-Kart experiences on Roblox. Whether you're seeking a high-speed challenge, a place to race with friends, or just an exciting way to dive into the world of motorsports, Ashworth Motorsports is your ultimate destination.

                        Our Go-Karts are designed to provide players of all ages with an unforgettable racing experience. At Ashworth Motorsports, we’re all about pushing the limits of fun while making safety our top priority. Our team is committed to upholding the highest standards of performance, ensuring that every race is smooth, safe, and filled with adrenaline-pumping excitement.

                        Join us at Ashworth Motorsports for the ride of a lifetime and feel the rush of competition as you race toward victory. We can't wait to see you on the track!
                    `)
                    .setColor('#213567')
                    .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
                    .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });
                break;

            case 'our-hours':
                embed = new EmbedBuilder()
                    .setTitle('Our Hours')
                    .setDescription("We're currently not open for business yet, however we'll let you know when this changes.")
                    .setColor('#213567')
                    .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
                    .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });
                break;

            case 'race-with-us':
                embed = new EmbedBuilder()
                    .setTitle('Race with Us')
                    .setDescription("Our track is currently under construction and isn’t ready yet. Please stay tuned for updates. We can’t wait to welcome you to an exciting racing experience once it's finished!")
                    .setColor('#FF0000')
                    .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
                    .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });
                break;

            case 'safety-statement':
                embed = new EmbedBuilder()
                    .setTitle('Safety Statement')
                    .setDescription(`
                        At Ashworth Motorsports, we prioritize the safety of all our customers and employees. However, due to the high-speed nature of Go-Kart racing, we acknowledge that there are inherent risks involved. The potential for injury to both participants and staff exists, and we take these risks very seriously.

                        To mitigate these risks, we ensure that all Go-Karts and safety equipment are regularly inspected and maintained to meet the highest standards. Our staff is trained and holds the proper certifications to work on or near the track, ensuring safety measures are effectively enforced. Before racing, all participants are provided with a thorough safety briefing, which includes important information about track rules, proper Go-Kart handling, and emergency procedures. Additionally, mandatory safety gear is provided to every participant.

                        We ask all customers to follow the safety rules and listen to staff instructions to minimize the chance of injury. By participating in our Go-Kart races, you acknowledge the potential risks and agree to comply with all safety guidelines.

                        At Ashworth Motorsports, your safety is our top priority. We are committed to delivering a fun and thrilling racing experience, while ensuring a safe environment through certified staff, thorough safety briefings, and strict safety protocols.
                    `)
                    .setColor('#213567')
                    .setThumbnail('https://i.ibb.co/35nvvqzc/dfd.png')
                    .setFooter({ text: 'Ashworth Motors', iconURL: 'https://i.ibb.co/WvYKNCKx/dfd-removebg-preview.png' });
                break;

            default:
                return interaction.reply('Invalid selection.');
        }

        // Reply with the embed
        await interaction.reply({ embeds: [embed] });
    },
};
