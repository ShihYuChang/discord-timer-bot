import dayjs from "dayjs";
import { SlashCommandBuilder } from "discord.js";
import { getTimeLabel } from "../../utils/time.js";

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

const saveDuration = async (date, duration) => {
  await fetch("http://localhost:8080/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, duration }),
  });
};

export async function execute(interaction) {
  const now = dayjs().locale("zh-TW").format("YYYY-MM-DD HH:mm:ss");
  const now_date = dayjs().locale("zh-TW").format("YYYY-MM-DD");
  try {
    const response = await fetch("http://localhost:8080/data");
    const jsonData = await response.json();
    const startData = jsonData.filter((item) => item.start);
    const startDataToday = startData.filter((item) =>
      item.start.startsWith(now_date)
    );
    if (startDataToday.length === 0) {
      await interaction.reply(
        "無今日開始時間資料，請先使用 /start-work 開始計時"
      );
      return;
    }
    const lastStart = startData[startData.length - 1].start;
    const workDuration = dayjs(now).diff(dayjs(lastStart), "second");
    const formattedDuration = getTimeLabel(workDuration);
    await saveEndTime(now);
    await saveDuration(now_date, workDuration);
    await interaction.reply(formattedDuration);
  } catch (err) {
    interaction.reply("發生錯誤，請稍後再試");
    console.log(err);
  }
}
