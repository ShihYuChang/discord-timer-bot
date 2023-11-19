import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { SlashCommandBuilder } from "discord.js";
import { getTimeLabel } from "../../utils/time.js";
dayjs.extend(customParseFormat);

export const data = new SlashCommandBuilder()
  .setName("monthly_working_hours")
  .setDescription("Get the total working hours of this month.");

const getMonthData = (apiData, type, month) => {
  const typeData = apiData.filter((item) => item[type]);
  const dateKey = type === "duration" ? "date" : type;
  const currentMonthData = typeData.filter((item) =>
    item[dateKey].startsWith(`${month}`)
  );
  return currentMonthData;
};

const filterLastDataPerDate = (apiData) => {
  const result = apiData.reduce((acc, currentValue) => {
    const existingItemIndex = acc.findIndex(
      (item) => item.date === currentValue.date
    );

    if (existingItemIndex !== -1) {
      acc[existingItemIndex] = currentValue;
    } else {
      acc.push(currentValue);
    }

    return acc;
  }, []);
  return result;
};

const getMonthWorkingSeconds = (apiData, month) => {
  const monthDurationData = getMonthData(apiData, "duration", month);
  const uniqueData = filterLastDataPerDate(monthDurationData);
  const totalHours = uniqueData.reduce((acc, currentValue) => {
    return acc + currentValue.duration;
  }, 0);
  return totalHours;
};

export async function execute(interaction) {
  await interaction.reply({
    content: "請輸入欲查詢月份 ( YYYY-MM )，例如 2023-11",
    fetchReply: true,
  });
  const collector = interaction.channel.createMessageCollector({ max: 1 });
  collector.on("collect", async (m) => {
    try {
      const targetMonth = m.content;
      if (dayjs(targetMonth, "YYYY-MM", true).isValid() === false) {
        interaction.channel.send(
          "日期格式錯誤，請輸入 YYYY-MM 格式，例如 2023-11"
        );
        return;
      }
      const response = await fetch("http://localhost:8080/data");
      const jsonData = await response.json();
      const totalSeconds = getMonthWorkingSeconds(jsonData, targetMonth);
      const workingTotal = getTimeLabel(totalSeconds);
      interaction.channel.send(`${targetMonth} 月工時：${workingTotal}`);
    } catch (err) {
      interaction.channel.send("發生錯誤，請稍後再試");
      console.log(err);
    }
  });
}
