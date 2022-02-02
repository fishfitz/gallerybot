require('dotenv').config()
const { Client, Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const addChannel = require('./addChannel');
const cronChannel = require('./cronChannel');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = [
	new SlashCommandBuilder().setName('create').setDescription('Create gallery from this channel'),
	new SlashCommandBuilder().setName('delete').setDescription('Delete gallery linked to this channel'),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, '938094471306948651'), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    const { commandName, channelId } = interaction;
    
    if (commandName === 'create') {
      interaction.reply(`:frame_photo: Blip bloup, gallery is created. :frame_photo:\n${process.env.BASE_URL}?c=${channelId}`);
      const channel = client.channels.cache.get(channelId);
      addChannel(channel);
    }
  });

client.once('ready', () => {
	console.log('Ready!');
  cronChannel(client);
});

client.login(process.env.DISCORD_TOKEN);