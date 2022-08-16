const { promises: fsp } = require('fs');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { RefreshingAuthProvider } = require('@twurple/auth');
const tmi = require('@twurple/auth-tmi');

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_SECRET;

//트위치 봇
(async () => {

	const tokenData = JSON.parse(await fsp.readFile('./tokens.json', 'UTF-8'));
	const authProvider = new RefreshingAuthProvider({
		clientId,
		clientSecret,
		onRefresh: async (newTokenData) => await fsp.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'UTF-8')
	}, tokenData);

	//chat bot

	const chatclient = new tmi.Client({
		options: { debug: true, messagesLogLevel: 'info' },
		connection: {
			reconnect: true,
			secure: true
		},
		authProvider: authProvider,
		channels: [process.env.TWITCH_TARGET]
	});
	chatclient.connect().catch(console.error);

	chatclient.on('message', (channel, tags, message, self) => {
		if (self) return;
		if (message === '!hello') {
			chatclient.say(channel, `@${tags.username}, heya!`);
		} else 	if (message === '!ping') {
			chatClient.say(channel, `pong!`)
		};
	});

})();





//디스코드 봇

const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

//commands handling
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}
//events handling
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});



client.login(process.env.DISCORD_TOKEN);

