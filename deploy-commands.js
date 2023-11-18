import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { promises as fs } from "fs";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

config();
const token = process.env.DISCORD_APP_TOKEN;
const clientId = process.env.DISCORD_APP_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");

try {
  const commandFolders = fs.readdir(foldersPath);

  for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdir(commandsPath);

    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = import(filePath);

      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token);

  // and deploy your commands!
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    console.log(commands);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
} catch (error) {
  console.error("Error reading command folders:", error);
}
