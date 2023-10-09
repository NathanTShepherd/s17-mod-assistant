require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'logban',
        description: 'Logs a ban that you have made against a player.',
        options: [
            {
                name: 'username',
                description: 'ROBLOX username of the player you are logging.',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'duration',
                description: 'Length of the ban.',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'offence',
                description: 'Reasoning of ban.',
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'exploiting',
                        value: 'Exploiting'
                    },
                    {
                        name: 'glitching',
                        value: 'Glitching'
                    },
                    {
                        name: 'abuse-of-in-game-mechanics',
                        value: 'Abusing in-game mechanics'
                    },
                    {
                        name: 'abusing-chat',
                        value: 'Abusing chat'
                    },
                    {
                        name: 'harassment',
                        value: 'Harassment'
                    },
                    {
                        name: 'other',
                        value: 'Other'
                    },
                ],
                required: true
            },
            {
                name: 'evidence',
                description: 'Required for any offence other than exploiting. Please use links only.',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'notes',
                description: 'Put any notes that you would like to add.',
                type: ApplicationCommandOptionType.String,
            },
        ]
    },
    {
        name: 'logwarning',
        description: 'Logs a warning you gave to a player.',
        options: [
            {
                name: 'username',
                description: 'Username of the player that you are warning.',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'reason',
                description: 'The reasoning behind the warning.',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'logkick',
        description: 'Logs a player that you kicked.',
        options: [
            {
                name: 'username',
                description: 'Username of the player that you kicked.',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'offence',
                description: 'The reasoning behind the kick.',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: 'glitching',
                        value: 'Glitching'
                    },
                    {
                        name: 'abuse-of-in-game-mechanics',
                        value: 'Abusing in-game mechanics'
                    },
                    {
                        name: 'abusing-chat',
                        value: 'Abusing chat'
                    },
                    {
                        name: 'harassment',
                        value: 'Harassment'
                    },
                    {
                        name: 'other',
                        value: 'Other'
                    },
                ]
            },
            {
                name: 'notes',
                description: 'Put any notes you would like to add.',
                type: ApplicationCommandOptionType.String,
            },
        ]
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands....');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Slash commands were registered successfully!');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();