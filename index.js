const { Client, GatewayIntentBits, PermissionsBitField, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const app = express();
const port = 3000; // El puerto puede ser cualquier número

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// Configuraciones del bot
const token = 'MTIwMTQwNzU0NTAxNzkwNTE5Mg.GfvJCn.9dSQIZ3qDEocuMZ2ajibGCHM73vVuPjNiwH6oo';
const clientId = '1201407545017905192';
const guildId = '1197281477872865380';

// Crea una nueva instancia del cliente
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'openTicket') {
        const ticketChannelName = `ticket-${interaction.user.username}`;
        const validChannelName = ticketChannelName.replace(/[^a-zA-Z0-9\-]/g, '-');

        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: validChannelName,
                type: 0,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]
            });

            // Embed y botón para cerrar el ticket
            const closeTicketButton = new ButtonBuilder()
                .setCustomId('closeTicket')
                .setLabel('Cerrar Ticket')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeTicketButton);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Ticket')
                .setDescription('Pulsa el botón de abajo para cerrar este ticket.');

            await ticketChannel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: `Ticket creado: ${ticketChannel}`, ephemeral: true });

        } catch (error) {
            console.error('Error al crear el canal del ticket:', error);
            await interaction.reply({ content: 'Hubo un error al crear el ticket.', ephemeral: true });
        }
    } else if (interaction.customId === 'closeTicket') {
        const channel = interaction.channel;
        try {
            await channel.delete();
        } catch (error) {
            console.error('Error al eliminar el canal del ticket:', error);
            await interaction.reply({ content: 'Hubo un error al cerrar el ticket.', ephemeral: true });
        }
    }
});

client.on('messageCreate', async message => {
    if (!message.guild) return;
    if (message.author.bot) return;

    // Comando para apagar el bot
    if (message.content === '!shutdown' && message.author.id === '739579939057172494') {
        await message.reply('Apagando el bot...').then(() => {
            client.destroy();
        });
    }

    // Comando para enviar un mensaje de apertura de ticket
    if (message.content === '!ticket') {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Soporte de Tickets')
            .setDescription('Haz clic en el botón de abajo para abrir un ticket.');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('openTicket')
                    .setLabel('Abrir Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.login('OTY3NTg0OTA5ODk4MTYyMjI3.GLlkFl.55HUy9IL-W_U4b6PAYs7N9cBwzAEfjYd4vgQss');
