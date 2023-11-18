import dayjs from "dayjs";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("start_work")
  .setDescription("Start the timer for work.");

export async function execute(interaction) {
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  try {
    await fetch("http://localhost:8080/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ start: now }),
    });
    const user = interaction.member.nickname || interaction.user.globalName;
    await interaction.channel.send(`${user} onboard!`);
  } catch (err) {
    interaction.reply("發生錯誤，請稍後再試");
    console.log(err);
  }
}
