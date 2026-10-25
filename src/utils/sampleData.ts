import { Habit, CompletionRecord, UserSettings } from '../types';
import { formatLocalDate, addDaysToDateString } from './dateUtils';

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Alex',
  theme: 'light',
  weekStartsOn: 1, // Monday
  reminderEnabled: false,
  soundEnabled: true,
  celebrationEnabled: true,
  onboardingCompleted: true,
};

export function getInitialSampleHabits(): Habit[] {
  const today = formatLocalDate();
  const startDate = addDaysToDateString(today, -28); // 4 weeks ago

  return [
    {
      id: 'habit-1',
      name: 'Drink 8 Glasses of Water',
      description: 'Stay hydrated throughout the day with fresh water.',
      category: 'health',
      icon: 'droplets',
      color: 'teal',
      frequency: { type: 'daily' },
      hasTarget: true,
      targetValue: 8,
      targetUnit: 'glasses',
      reminderTime: '09:00',
      createdAt: startDate,
    },
    {
      id: 'habit-2',
      name: 'Deep Work & Study Session',
      description: 'Focus with zero phone distractions for uninterrupted flow.',
      category: 'study',
      icon: 'book-open',
      color: 'indigo',
      frequency: { type: 'weekdays' },
      hasTarget: true,
      targetValue: 45,
      targetUnit: 'mins',
      reminderTime: '14:00',
      createdAt: startDate,
    },
    {
      id: 'habit-3',
      name: 'Morning Workout & Stretch',
      description: 'Brisk exercise, yoga or gym session to awaken energy.',
      category: 'fitness',
      icon: 'dumbbell',
      color: 'emerald',
      frequency: {
        type: 'specific_days',
        days: [1, 2, 3, 5, 6], // Mon, Tue, Wed, Fri, Sat
      },
      hasTarget: true,
      targetValue: 30,
      targetUnit: 'mins',
      reminderTime: '07:30',
      createdAt: startDate,
    },
    {
      id: 'habit-4',
      name: 'Read 15 Pages of Book',
      description: 'Read non-fiction, personal growth or novel before bed.',
      category: 'mindfulness',
      icon: 'sparkles',
      color: 'amber',
      frequency: { type: 'daily' },
      hasTarget: true,
      targetValue: 15,
      targetUnit: 'pages',
      reminderTime: '21:30',
      createdAt: startDate,
    },
    {
      id: 'habit-5',
      name: 'Sleep Before 11:00 PM',
      description: 'Turn off screens by 10:30 PM for high-quality rest.',
      category: 'lifestyle',
      icon: 'moon',
      color: 'violet',
      frequency: { type: 'daily' },
      hasTarget: false,
      reminderTime: '22:30',
      createdAt: startDate,
    },
    {
      id: 'habit-6',
      name: 'Daily Meditation & Breathwork',
      description: 'Quiet mindfulness session to de-stress and reset focus.',
      category: 'mindfulness',
      icon: 'brain',
      color: 'rose',
      frequency: { type: 'daily' },
      hasTarget: true,
      targetValue: 10,
      targetUnit: 'mins',
      reminderTime: '08:00',
      createdAt: startDate,
    },
  ];
}

/**
 * Generates initial realistic completion records spanning the last 28 days
 * so the charts, heatmaps, streaks and badges look alive from the start!
 */
export function getInitialSampleCompletions(habits: Habit[]): CompletionRecord[] {
  const records: CompletionRecord[] = [];
  const today = formatLocalDate();

  // Deterministic seed simulation based on habit index and day
  for (let daysAgo = 28; daysAgo >= 0; daysAgo--) {
    const dateStr = addDaysToDateString(today, -daysAgo);
    const dayOfWeek = (daysAgo % 7);

    habits.forEach((habit, hIdx) => {
      // Don't auto-complete today for habits 2-6 so user has habits to complete today!
      if (daysAgo === 0) {
        if (hIdx === 0) {
          // Water partially completed today: 6/8
          records.push({
            habitId: habit.id,
            date: dateStr,
            completed: false,
            currentValue: 6,
          });
        }
        return;
      }

      // Past days realistic completion patterns
      // Habit 1 (Water): very consistent (90% completion)
      // Habit 2 (Study): completed on weekdays (80%)
      // Habit 3 (Workout): completed on its days (75%)
      // Habit 4 (Read): 85% completion
      // Habit 5 (Sleep): 70% completion
      // Habit 6 (Meditation): 80% completion
      const patternValue = (daysAgo * 7 + hIdx * 13) % 10;
      let shouldComplete = false;

      if (hIdx === 0) shouldComplete = patternValue < 9;
      else if (hIdx === 1) shouldComplete = patternValue < 8 && dayOfWeek !== 0 && dayOfWeek !== 6;
      else if (hIdx === 2) shouldComplete = patternValue < 8;
      else if (hIdx === 3) shouldComplete = patternValue < 8;
      else if (hIdx === 4) shouldComplete = patternValue < 7;
      else if (hIdx === 5) shouldComplete = patternValue < 8;

      if (shouldComplete) {
        records.push({
          habitId: habit.id,
          date: dateStr,
          completed: true,
          currentValue: habit.targetValue || 1,
          completedAt: `${dateStr}T${habit.reminderTime || '12:00'}:00.000Z`,
        });
      }
    });
  }

  return records;
}
