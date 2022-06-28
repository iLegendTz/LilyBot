const fs = require('fs');
const path = require('path');

// Require the necessary discord.js classes
const { Client, Intents, Collection } = require('discord.js');

require('dotenv').config();

const discordToken = process.env.DISCORD_TOKEN;
// TODO - Este prefijo puede ser diferente por servidor
const prefix = '>';

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).split(/ +/);

  const command = client.commands.get(args.shift().toLowerCase());
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    await message.reply('There was an error trying to execute that command!');
    console.error(`Error: ${error.message}`);
  }
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Owaaaa!');
});

// Login to Discord with your client's token
client.login(discordToken);
