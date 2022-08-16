const { ApiClient } = require('@twurple/api');
const { DirectConnectionAdapter, EventSubListener } = require('@twurple/eventsub');
const { NgrokAdapter } = require('@twurple/eventsub-ngrok');

const { ClientCredentialsAuthProvider, StaticAuthProvider } = require('@twurple/auth');
const { SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
require('dotenv').config();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_SECRET;

const fs = require('fs')

const jsonFile = fs.readFileSync('././tokens.json', 'utf8');
const jsonData = JSON.parse(jsonFile);
const accessToken = jsonData.accessToken;

const userId = process.env.TWITCH_USERID;

module.exports = {
	name: 'ready',
	execute(client) {
        //listner
        const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
        const apiClient = new ApiClient({ authProvider : authProvider });

        apiClient.eventSub.deleteAllSubscriptions();

        const listener = new EventSubListener({
            apiClient,
            adapter: new NgrokAdapter(),
            secret: process.env.NGROK_SECRET
        });
    
        listener.listen();

        
        const onlineSubscription = listener.subscribeToStreamOnlineEvents(userId, e => {
            console.log(`${e.broadcasterDisplayName} 온라인`);
            client.user.setActivity('xxx', { type: ActivityType.Watching });

            async function notification(title, game) {
                const emoji = client.emojis.cache.get("xxxx")
                const channel = client.channels.cache.get('xxxx');
                const TwitchEmbed =  await new EmbedBuilder()
                    .setColor(0xF39297)
                    .setTitle(title)
                    .setURL('https://www.twitch.tv/xxx')
                    .setAuthor({ name: 'xxx', iconURL: 'xxxxxx'})
                    .setThumbnail('xxxxxx')
                    .addFields({ name: '게임', value: game })
                    .setImage('https://static-cdn.jtvnw.net/previews-ttv/live_user_{xxxxxx}-960x540.jpg');
                channel.send({ content: `@everyone, xx님이 방송중입니다! ${emoji}\n https://www.twitch.tv/xxxx`, embeds: [TwitchEmbed] });
                return console.log('방송 알림 업로드');
            }
            async function getstreaminfo() {
                const authProvider02 = new StaticAuthProvider(clientId, accessToken);
                const apiClient02 = new ApiClient({ authProvider : authProvider02 });
            
                const stream = await apiClient02.streams.getStreamByUserId(userId);
                if (!stream.gameName) {
                    return false;
                }
                return { title : stream.title , game : stream.gameName };
            }
            
            getstreaminfo().then((result) => {
                const title = result.title
                const game = result.game
                notification(title, game);
            });
    
        });
        const offlineSubscription = listener.subscribeToStreamOfflineEvents(userId, e => {
            console.log(`${e.broadcasterDisplayName} 오프라인`);
            client.user.setActivity('xxx', { type: ActivityType.Watching });
        });

	}
};
