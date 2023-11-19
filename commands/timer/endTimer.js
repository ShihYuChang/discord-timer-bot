import dayjs from "dayjs";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("off_work")
  .setDescription("End the timer for work.");

const saveEndTime = async (time) => {
  await fetch("http://localhost:8080/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ end: time }),
  });
};

export async function execute(interaction) {
  const now = dayjs().locale("zh-TW").format("YYYY-MM-DD HH:mm:ss");
  try {
    const response = await fetch("http://localhost:8080/data");
    const jsonData = await response.json();
    const startData = jsonData.filter((item) => item.start);
    if (startData.length === 0) {
      await interaction.reply("無開始時間資料，請先使用 /start-work 開始計時");
      return;
    }
    const lastStart = startData[startData.length - 1].start;
    const workDuration = dayjs(now).diff(dayjs(lastStart), "second");

    const hours = Math.floor(workDuration / 3600);
    const minutes = Math.floor((workDuration % 3600) / 60);
    const seconds = workDuration % 60;

    const formattedDuration = `working_hours: ${String(hours).padStart(
      2,
      "0"
    )} 小時 ${String(minutes).padStart(2, "0")} 分 ${String(seconds).padStart(
      2,
      "0"
    )} 秒
結束時間：${now}`;
    await saveEndTime(now);
    await interaction.reply(formattedDuration);
  } catch (err) {
    interaction.reply("發生錯誤，請稍後再試");
    console.log(err);
  }
}
