export const getTimeLabel = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;
  return `${String(hours).padStart(2, "0")} 小時 ${String(minutes).padStart(
    2,
    "0"
  )} 分 ${String(secondsLeft).padStart(2, "0")} 秒`;
};
