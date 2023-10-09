require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, PermissionsBitField } = require('discord.js');
const roblox = require('noblox.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

const CommandPermissions = {
    logban: ['Moderation Team'],
    logwarning: ['Moderation Team'],
    logkick: ['Moderation Team'],
};

function runPermissions(interaction, command) {
    var allowed = false
    for (const x of CommandPermissions[command]) {
        for (const y of interaction.member.roles.cache) {
            if (y[1].name === x) {
                allowed = true
            }
        }
    }
    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        allowed = true
    };
    return allowed
};

function confirmationMessage() {
    const sendButton = new ButtonBuilder()
        .setLabel('Send')
        .setStyle(ButtonStyle.Success)
        .setCustomId('send-button')
            
    const cancelButton = new ButtonBuilder()
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('cancel-button')

    const buttonRow = new ActionRowBuilder().addComponents(sendButton, cancelButton);

    return buttonRow
};

const colorPallet = {
    green: 0x57F288,
    yellow: 0xFEE65C,
    red: 0xED4245,
    blue: 0x3498DB,
    orange: 0xE67E22,
    black: 0x00000B
}

function ErrorMessage(message,customText) {
    const newEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setColor(0xED4245)
        .setDescription(customText)
    message.reply({ embeds: [newEmbed] })
};

function CustomMessage(title,desc,color) {
    const newEmbed = new EmbedBuilder()
        .setTitle(title)
        .setColor(colorPallet[color])
        .setDescription(desc)
    return newEmbed
}

function SuccessMessage(message,customText) {
    const newEmbed = new EmbedBuilder()
        .setTitle('Success')
        .setColor(0x57F288)
        .setDescription(customText)
    message.reply({ embeds: [newEmbed] })
};

function InteractionSuccessMessage(customText) {
    const newEmbed = new EmbedBuilder()
        .setTitle('Success')
        .setColor(0x57F288)
        .setDescription(customText)
    return newEmbed
};

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online!`)
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    let moderation_log_channel = interaction.guild.channels.cache.find(channel => channel.name === 'action-logs');
    let warning_log_channel = interaction.guild.channels.cache.find(channel => channel.name === 'warnings');

    if (interaction.commandName === 'logban') {
        if (!runPermissions(interaction, 'logban')) {
            ErrorMessage(interaction, 'Insufficient permissions.')
            return
        };

        const player = interaction.options.get('username').value
        const duration = interaction.options.get('duration').value
        const offence = interaction.options.get('offence').value
        const evidence = interaction.options.get('evidence').value
        const pid = await roblox.getIdFromUsername(player);
        var realPlayer

        function CheckForNotes() {
            if (interaction.options.get('notes')) {
                return { name: 'Notes', value: interaction.options.get('notes').value, inline: true };
            } else {
                return { name: ' ', value: ' ', inline: true };
            }
        };
        
        if (pid) {
            realPlayer = await roblox.getUsernameFromId(pid);
            const playerAvatar = await roblox.getPlayerThumbnail(pid, "48x48", "png", false, 'Headshot')
            const newEmbed = new EmbedBuilder()
                .setTitle('Ban')
                .setColor(0xED4245)
                .setThumbnail(playerAvatar[0].imageUrl)
                .addFields(
                    { name: 'Username', value: `[${realPlayer}](https://www.roblox.com/users/${pid}/profile)`, inline: true },
                    { name: 'Duration', value: duration, inline: true },
                    { name: 'Offence', value: offence, inline: true },
                    { name: 'Evidence', value: evidence, inline: true },
                    CheckForNotes())
                .setFooter({ text: interaction.member.displayName })
            
            const sendButton = new ButtonBuilder()
                .setLabel('Send')
                .setStyle(ButtonStyle.Success)
                .setCustomId('send-button')
            
            const cancelButton = new ButtonBuilder()
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
                .setCustomId('cancel-button')

            const buttonRow = new ActionRowBuilder().addComponents(sendButton, cancelButton);

            const reply = await interaction.reply({ content: 'Would you like to send this message?', embeds: [newEmbed], components: [buttonRow], flags: 64 });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });

            collector.on('collect', (interactionButton) => {
                if (interactionButton.customId === 'send-button') {
                    moderation_log_channel.send({ embeds: [newEmbed] });
                    interaction.deleteReply();
                    interactionButton.channel.send({ content: '<@!' + interaction.member.id + '>', embeds: [InteractionSuccessMessage(`Your ban log for ${realPlayer} has been sent in <#${moderation_log_channel.id}>.`)] })
                } else if (interactionButton.customId === 'cancel-button') {
                    interactionButton.channel.send({ content: '<@!' + interaction.member.id + '>', embeds: [CustomMessage('Cancellation','Your ban log as been cancelled.','blue')] });
                    interaction.deleteReply()
                }
            })
        } else {
            ErrorMessage(interaction,"The username ``" + player + "`` does not exist.")
        }
    };

    if (interaction.commandName === 'logwarning') {
        if (!runPermissions(interaction, 'logwarning')) {
            ErrorMessage(interaction, 'Insufficient permissions.')
            return
        };

        const player = interaction.options.get('username').value;
        const reason = interaction.options.get('reason').value;
        const pid = await roblox.getIdFromUsername(player);
        var realPlayer

        if (pid) {
            realPlayer = await roblox.getUsernameFromId(pid);
            const playerAvatar = await roblox.getPlayerThumbnail(pid, "48x48", "png", false, 'Headshot');

            const newEmbed = new EmbedBuilder()
                .setTitle('Warning')
                .setColor(0xFEE65C)
                .setThumbnail(playerAvatar[0].imageUrl)
                .addFields(
                    { name: 'Username', value: `[${realPlayer}](https://www.roblox.com/users/${pid}/profile)`, inline: true },
                    { name: 'Reason', value: reason, inline: true },)
                .setFooter({ text: interaction.member.displayName })
            
            const reply = await interaction.reply({ content: 'Would you like to send this message?', embeds: [newEmbed], components: [confirmationMessage()], flags: 64 });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });

            collector.on('collect', (interactionButton) => {
                if (interactionButton.customId === 'send-button') {
                    warning_log_channel.send({ embeds: [newEmbed] });
                    interaction.deleteReply();
                    interactionButton.channel.send({ content: '<@!' + interaction.member.id + '>', embeds: [InteractionSuccessMessage(`Your warning log for ${realPlayer} has been sent in <#${warning_log_channel.id}>.`)] })
                } else if (interactionButton.customId === 'cancel-button') {
                    interactionButton.channel.send({ content: '<@!' + interaction.member.id + '>', embeds: [CustomMessage('Cancellation','Your warning log as been cancelled.','blue')] });
                    interaction.deleteReply()
                }
            });
        } else {
            ErrorMessage(interaction, "The username ``" + player + "`` does not exist.")
        }
    }

    if (interaction.commandName === 'logkick') {
        if (!runPermissions(interaction, 'logkick')) {
            ErrorMessage(interaction, 'Insufficient permissions.')
            return
        };

        const player = interaction.options.get('username').value;
        const offence = interaction.options.get('offence').value;
        const pid = await roblox.getIdFromUsername(player);
        var realPlayer

        function CheckForNotes() {
            if (interaction.options.get('notes')) {
                return { name: 'Notes', value: interaction.options.get('notes').value, inline: true };
            } else {
                return { name: ' ', value: ' ', inline: true };
            }
        };

        if (pid) {
            realPlayer = await roblox.getUsernameFromId(pid);
            const playerAvatar = await roblox.getPlayerThumbnail(pid, "48x48", "png", false, 'Headshot');

            const newEmbed = new EmbedBuilder()
                .setTitle('Kick')
                .setColor(0xFEE65C)
                .setThumbnail(playerAvatar[0].imageUrl)
                .addFields(
                    { name: 'Username', value: `[${realPlayer}](https://www.roblox.com/users/${pid}/profile)`, inline: true },
                    { name: 'Offence', value: offence, inline: true },
                    CheckForNotes())
                .setFooter({ text: interaction.member.displayName })
            
            const reply = await interaction.reply({ content: 'Would you like to send this message?', embeds: [newEmbed], components: [confirmationMessage()], flags: 64 });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });

            collector.on('collect', (interactionButton) => {
                if (interactionButton.customId === 'send-button') {
                    moderation_log_channel.send({ embeds: [newEmbed] });
                    interaction.deleteReply();
                    interactionButton.channel.send({ content: '<@!' + interaction.member.id + '>', embeds: [InteractionSuccessMessage(`Your kick log for ${realPlayer} has been sent in <#${moderation_log_channel.id}>.`)] })
                } else if (interactionButton.customId === 'cancel-button') {
                    interactionButton.channel.send({ content: '<@!' + interaction.member.id + '>', embeds: [CustomMessage('Cancellation','Your kick log as been cancelled.','blue')] });
                    interaction.deleteReply()
                }
            });
        } else {
            ErrorMessage(interaction, "The username ``" + player + "`` does not exist.")
        }
    }
});

client.login(process.env.TOKEN)