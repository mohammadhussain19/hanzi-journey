export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
}

function utcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function updateStreak(state: StreakState, activityDate: Date): StreakState {
  if (Number.isNaN(activityDate.getTime())) throw new RangeError("Activity date is invalid.");
  const last = state.lastActivityDate;
  if (last && Number.isNaN(last.getTime())) throw new RangeError("Previous activity date is invalid.");
  const dayGap = last ? Math.round((utcDay(activityDate) - utcDay(last)) / 86_400_000) : 0;
  if (dayGap <= 0) return { ...state, lastActivityDate: last ?? activityDate };
  const currentStreak = dayGap === 1 ? state.currentStreak + 1 : 1;
  return {
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastActivityDate: activityDate,
  };
}
