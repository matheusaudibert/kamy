const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { BOT_TOKEN } = require("./src/config/config");
const userCommand = require("./src/commands/user");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Map();
client.commands.set(userCommand.data.name, userCommand);

client.once("ready", () => {
  console.log("Kamy ready!");

  client.user.setPresence({
    status: "dnd",
    activities: [
      {
        name: "/user",
        type: ActivityType.Competing,
      },
    ],
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {}
});

client.login(BOT_TOKEN);
