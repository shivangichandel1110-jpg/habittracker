import { Badge, Habit, CompletionRecord } from '../types';
import { calculateHabitStreak } from './streakUtils';

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Completed your very first habit!',
    icon: 'footprints',
    category: 'total',
    targetRequirement: '1 completion',
  },
  {
    id: 'streak_3',
    title: 'Momentum Builder',
    description: 'Maintained a 3-day streak on any scheduled habit.',
    icon: 'flame',
    category: 'streak',
    targetRequirement: '3-day streak',
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintained a solid 7-day streak.',
    icon: 'zap',
    category: 'streak',
    targetRequirement: '7-day streak',
  },
  {
    id: 'streak_14',
    title: 'Consistency Champion',
    description: 'Two full weeks unbroken consistency.',
    icon: 'shield-check',
    category: 'streak',
    targetRequirement: '14-day streak',
  },
  {
    id: 'streak_21',
    title: 'Habit Master',
    description: 'Achieved the 21-day neurological habit formation milestone.',
    icon: 'crown',
    category: 'streak',
    targetRequirement: '21-day streak',
  },
  {
    id: 'total_30',
    title: 'Rising Star',
    description: 'Completed 30 total habits across your journey.',
    icon: 'star',
    category: 'total',
    targetRequirement: '30 completions',
  },
  {
    id: 'total_100',
    title: 'Century Club',
    description: 'Surpassed 100 total habit completions!',
    icon: 'award',
    category: 'total',
    targetRequirement: '100 completions',
  },
  {
    id: 'variety_4',
    title: 'Renaissance Routine',
    description: 'Maintained habits across at least 4 different categories.',
    icon: 'compass',
    category: 'variety',
    targetRequirement: '4 categories',
  },
  {
    id: 'perfect_day',
    title: 'Flawless Day',
    description: 'Completed 100% of all scheduled habits in a single day.',
    icon: 'sparkles',
    category: 'consistency',
    targetRequirement: '1 perfect day',
  },
];

export function computeBadges(habits: Habit[], records: CompletionRecord[]): Badge[] {
  const completedRecords = records.filter((r) => r.completed);
  const totalCompletedCount = completedRecords.length;

  let maxStreak = 0;
  for (const habit of habits) {
    const s = calculateHabitStreak(habit, records);
    if (s.longestStreak > maxStreak) maxStreak = s.longestStreak;
    if (s.currentStreak > maxStreak) maxStreak = s.currentStreak;
  }

  // Active categories with completions
  const categoriesWithCompletions = new Set<string>();
  const habitMap = new Map<string, Habit>();
  habits.forEach((h) => habitMap.set(h.id, h));

  for (const r of completedRecords) {
    const h = habitMap.get(r.habitId);
    if (h) categoriesWithCompletions.add(h.category);
  }

  // Check for any perfect day (all scheduled habits completed on that day, min 2 habits)
  // Group completions by date
  const completionsByDate = new Map<string, number>();
  for (const r of completedRecords) {
    completionsByDate.set(r.date, (completionsByDate.get(r.date) || 0) + 1);
  }
  let hasPerfectDay = false;
  completionsByDate.forEach((count) => {
    if (count >= 3) {
      hasPerfectDay = true;
    }
  });

  return BADGE_DEFINITIONS.map((def) => {
    let progress = 0;
    let unlocked = false;

    switch (def.id) {
      case 'first_step':
        progress = Math.min(100, (totalCompletedCount / 1) * 100);
        unlocked = totalCompletedCount >= 1;
        break;
      case 'streak_3':
        progress = Math.min(100, Math.round((maxStreak / 3) * 100));
        unlocked = maxStreak >= 3;
        break;
      case 'streak_7':
        progress = Math.min(100, Math.round((maxStreak / 7) * 100));
        unlocked = maxStreak >= 7;
        break;
      case 'streak_14':
        progress = Math.min(100, Math.round((maxStreak / 14) * 100));
        unlocked = maxStreak >= 14;
        break;
      case 'streak_21':
        progress = Math.min(100, Math.round((maxStreak / 21) * 100));
        unlocked = maxStreak >= 21;
        break;
      case 'total_30':
        progress = Math.min(100, Math.round((totalCompletedCount / 30) * 100));
        unlocked = totalCompletedCount >= 30;
        break;
      case 'total_100':
        progress = Math.min(100, Math.round((totalCompletedCount / 100) * 100));
        unlocked = totalCompletedCount >= 100;
        break;
      case 'variety_4':
        progress = Math.min(100, Math.round((categoriesWithCompletions.size / 4) * 100));
        unlocked = categoriesWithCompletions.size >= 4;
        break;
      case 'perfect_day':
        progress = hasPerfectDay ? 100 : 0;
        unlocked = hasPerfectDay;
        break;
    }

    return {
      ...def,
      progress,
      unlockedAt: unlocked ? 'Unlocked' : null,
    };
  });
}

/**
 * Returns an encouraging, gentle message tailored to the current completion percentage.
 */
export function getMotivationalMessage(percentage: number, completedCount: number, totalCount: number): {
  headline: string;
  subtitle: string;
} {
  if (totalCount === 0) {
    return {
      headline: 'Welcome to your mindful habit journey.',
      subtitle: 'Add your first daily routine to begin cultivating positive momentum.',
    };
  }

  if (percentage === 100) {
    return {
      headline: 'Outstanding! All habits completed today! 🎉',
      subtitle: 'You’ve reached 100% of your daily goals. Take a moment to celebrate your dedication.',
    };
  }

  if (percentage >= 75) {
    return {
      headline: 'Almost there! You are in the flow.',
      subtitle: `Only ${totalCount - completedCount} more habit${totalCount - completedCount > 1 ? 's' : ''} to reach perfection today. Keep going!`,
    };
  }

  if (percentage >= 50) {
    return {
      headline: 'Halfway through your daily goals!',
      subtitle: 'Great progress so far. Small, consistent actions compound into life-changing habits.',
    };
  }

  if (percentage > 0) {
    return {
      headline: 'Great start today!',
      subtitle: `You’ve completed ${completedCount} habit${completedCount > 1 ? 's' : ''}. Every step forward builds real momentum.`,
    };
  }

  return {
    headline: 'Ready for today’s routines?',
    subtitle: 'Consistency is about showing up. Take it one mindful habit at a time.',
  };
}
