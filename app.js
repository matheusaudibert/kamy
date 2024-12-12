const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { BOT_TOKEN } = require('./src/config/config');
const userCommand = require('./src/commands/user');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Map();
client.commands.set(userCommand.data.name, userCommand);

client.once('ready', () => {
  console.log("Kamy ready!");
  client.user.setPresence({
    activities: [
      {
        name: '/user your_id',
        type: ActivityType.Playing,
      }
    ],
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
  }
});

client.login(BOT_TOKEN);
