const { SlashCommandBuilder, ActivityType } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log('디스코드 봇 준비됨')
		client.user.setActivity('xxx', { type: ActivityType.Watching });
	}
};