export type HabitCategory =
  | 'health'
  | 'study'
  | 'productivity'
  | 'mindfulness'
  | 'fitness'
  | 'lifestyle'
  | 'custom';

export type FrequencyType =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'specific_days'
  | 'times_per_week';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  color: string; // Tailwind color family name: emerald, teal, sky, indigo, violet, rose, amber, slate
  frequency: {
    type: FrequencyType;
    days?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    targetTimesPerWeek?: number; // e.g., 3
  };
  hasTarget: boolean;
  targetValue?: number; // e.g., 8
  targetUnit?: string;  // e.g., 'glasses', 'pages', 'mins'
  reminderTime?: string; // 'HH:MM'
  createdAt: string; // YYYY-MM-DD
  archived?: boolean;
}

export interface CompletionRecord {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  currentValue?: number;
  completedAt?: string;
  notes?: string;
}

export interface UserSettings {
  userName: string;
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  reminderEnabled: boolean;
  soundEnabled: boolean;
  celebrationEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'total' | 'consistency' | 'variety';
  unlockedAt?: string | null;
  progress: number; // 0 to 100
  targetRequirement: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'habits'
  | 'calendar'
  | 'stats'
  | 'goals'
  | 'settings';
