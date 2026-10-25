import { Habit, CompletionRecord } from '../types';
import { formatLocalDate, addDaysToDateString, isHabitScheduledForDate } from './dateUtils';

export interface HabitStreakResult {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0 to 100 percentage
}

/**
 * Calculates current streak and longest streak based on scheduled days for a habit.
 */
export function calculateHabitStreak(
  habit: Habit,
  records: CompletionRecord[],
  referenceDateStr: string = formatLocalDate()
): HabitStreakResult {
  // Build a lookup map of completed dates for this habit
  const completedDates = new Set<string>();
  for (const r of records) {
    if (r.habitId === habit.id && r.completed) {
      completedDates.add(r.date);
    }
  }

  // Generate all scheduled dates from createdAt to referenceDateStr
  const scheduledDates: string[] = [];
  let cur = habit.createdAt;
  // If habit was created in the future somehow, guard against loop
  if (cur > referenceDateStr) {
    cur = referenceDateStr;
  }

  while (cur <= referenceDateStr) {
    if (isHabitScheduledForDate(habit, cur)) {
      scheduledDates.push(cur);
    }
    cur = addDaysToDateString(cur, 1);
  }

  const totalScheduled = scheduledDates.length;
  let totalCompletions = 0;
  for (const date of scheduledDates) {
    if (completedDates.has(date)) {
      totalCompletions++;
    }
  }

  // If no scheduled dates, return 0
  if (totalScheduled === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completionRate: 0,
    };
  }

  // Calculate longest streak across all scheduled dates
  let longestStreak = 0;
  let tempStreak = 0;
  for (const date of scheduledDates) {
    if (completedDates.has(date)) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak
  // Look at the latest scheduled dates working backwards
  let currentStreak = 0;
  const isTodayScheduled = isHabitScheduledForDate(habit, referenceDateStr);
  const isTodayCompleted = completedDates.has(referenceDateStr);

  let startIndex = scheduledDates.length - 1;

  if (isTodayScheduled) {
    if (isTodayCompleted) {
      // Today is done, count backwards starting from today
      startIndex = scheduledDates.length - 1;
    } else {
      // Today is scheduled but not yet completed. The streak is still alive
      // based on the previous scheduled day, so start counting from yesterday's scheduled day
      startIndex = scheduledDates.length - 2;
    }
  } else {
    // Today is not scheduled, so streak is based on the last scheduled day
    startIndex = scheduledDates.length - 1;
  }

  for (let i = startIndex; i >= 0; i--) {
    const d = scheduledDates[i];
    if (completedDates.has(d)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Add today if today was completed
  if (isTodayScheduled && isTodayCompleted && startIndex === scheduledDates.length - 2) {
    currentStreak++;
  }

  const completionRate = totalScheduled > 0 ? Math.round((totalCompletions / totalScheduled) * 100) : 0;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate,
  };
}

/**
 * Calculates global stats across all active habits:
 * - Active habits count
 * - Completed today count
 * - Today's completion %
 * - Best current streak among habits
 * - Overall best streak
 */
export function calculateGlobalStats(
  habits: Habit[],
  records: CompletionRecord[],
  targetDateStr: string = formatLocalDate()
) {
  const activeHabits = habits.filter((h) => !h.archived);
  const scheduledToday = activeHabits.filter((h) => isHabitScheduledForDate(h, targetDateStr));

  const completedTodayRecords = records.filter(
    (r) => r.date === targetDateStr && r.completed
  );
  const completedTodaySet = new Set(completedTodayRecords.map((r) => r.habitId));

  const completedTodayCount = scheduledToday.filter((h) => completedTodaySet.has(h.id)).length;
  const totalScheduledToday = scheduledToday.length;

  const todayPercentage = totalScheduledToday > 0
    ? Math.round((completedTodayCount / totalScheduledToday) * 100)
    : 0;

  let bestCurrentStreak = 0;
  let bestLongestStreak = 0;
  let totalCompletionsAllTime = 0;

  for (const habit of activeHabits) {
    const s = calculateHabitStreak(habit, records, targetDateStr);
    if (s.currentStreak > bestCurrentStreak) bestCurrentStreak = s.currentStreak;
    if (s.longestStreak > bestLongestStreak) bestLongestStreak = s.longestStreak;
    totalCompletionsAllTime += s.totalCompletions;
  }

  return {
    activeHabitsCount: activeHabits.length,
    scheduledTodayCount: totalScheduledToday,
    completedTodayCount,
    todayPercentage,
    bestCurrentStreak,
    bestLongestStreak,
    totalCompletionsAllTime,
  };
}
