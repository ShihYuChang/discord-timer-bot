import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { promises as fs } from "fs";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

config();
const token = process.env.DISCORD_APP_TOKEN;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");

// Asynchronous readdir method
async function readCommands() {
  try {
    const commandFolders = await fs.readdir(foldersPath);

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles_raw = await fs.readdir(commandsPath);
      const commandFiles = commandFiles_raw.filter((file) =>
        file.endsWith(".js")
      );
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const commandModule = await import(filePath);
        const command = commandModule.default || commandModule;

        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    }

    // Log in to Discord with your client's token
    await client.login(token);
  } catch (error) {
    console.error("Error reading command files:", error);
  }
}

// Call the asynchronous function to read and set commands
readCommands();

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});
