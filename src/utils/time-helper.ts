export function getCurrentHour(): number {
  return new Date().getHours();
}

export function isLateNight(): boolean {
  const hour = getCurrentHour();
  return hour >= 22 || hour < 6;
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function getDaysSince(date: Date | null): number {
  if (!date) return 0;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
