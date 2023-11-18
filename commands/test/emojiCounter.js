import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("count-emoji")
  .setDescription("Count the total number of emoji in a message.");

export async function execute(interaction) {
  await interaction.reply({
    content: "What's the message ID?",
    fetchReply: true,
  });
  const collector = interaction.channel.createMessageCollector({ max: 1 });
  collector.on("collect", async (m) => {
    try {
      if (!isNaN(Number(m.content))) {
        const messageId = m.content;
        const message = await interaction.channel.messages.fetch({
          message: messageId,
          cache: false,
          force: true,
        });
        const reactions = message.reactions.valueOf();
        const totalReactionsCount = reactions.reduce(
          (acc, cur) => acc + cur.count,
          0
        );
        interaction.channel.send(`Total Emojis: ${totalReactionsCount}`);
      } else {
        interaction.channel.send("Invalid message ID.");
      }
    } catch (error) {
      if (error.message === "Unknown Message") {
        interaction.channel.send(
          "Message not found. Only messages in the current channel can be counted."
        );
        return;
      }
      console.error(error);
      interaction.channel.send(
        "There was an error while executing this command, please try again."
      );
    }
  });
}
