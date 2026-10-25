import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Habit,
  CompletionRecord,
  UserSettings,
  ActiveTab,
  Badge,
} from '../types';
import {
  loadHabitsFromStorage,
  saveHabitsToStorage,
  loadCompletionsFromStorage,
  saveCompletionsToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  clearAllStorageData,
} from '../utils/storage';
import { formatLocalDate, addDaysToDateString, isHabitScheduledForDate } from '../utils/dateUtils';
import { calculateGlobalStats } from '../utils/streakUtils';
import { computeBadges } from '../utils/badgeUtils';
import { soundService } from '../utils/soundUtils';
import { getInitialSampleHabits, getInitialSampleCompletions } from '../utils/sampleData';

interface HabitContextValue {
  habits: Habit[];
  completions: CompletionRecord[];
  settings: UserSettings;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  stats: ReturnType<typeof calculateGlobalStats>;
  badges: Badge[];
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  editHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, targetDateStr?: string) => void;
  updateHabitProgress: (habitId: string, value: number, targetDateStr?: string) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetAllData: () => void;
  restoreSampleHabits: () => void;
  importData: (habits: Habit[], completions: CompletionRecord[], settings?: UserSettings) => void;
  triggerConfetti: () => void;
  isDateCompleted: (habitId: string, dateStr: string) => boolean;
  getCompletionForDate: (habitId: string, dateStr: string) => CompletionRecord | undefined;
}

const HabitContext = createContext<HabitContextValue | null>(null);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabitsFromStorage());
  const [completions, setCompletions] = useState<CompletionRecord[]>(() =>
    loadCompletionsFromStorage(habits)
  );
  const [settings, setSettings] = useState<UserSettings>(() => loadSettingsFromStorage());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatLocalDate());

  // Keep dark mode class in sync with settings
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Persist habits
  useEffect(() => {
    saveHabitsToStorage(habits);
  }, [habits]);

  // Persist completions
  useEffect(() => {
    saveCompletionsToStorage(completions);
  }, [completions]);

  // Persist settings
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  const triggerConfetti = useCallback(() => {
    if (!settings.celebrationEnabled) return;
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#14b8a6', '#6366f1', '#f59e0b', '#38bdf8'],
      });
    } catch {
      // Safely ignore if canvas not supported
    }
  }, [settings.celebrationEnabled]);

  const isDateCompleted = useCallback(
    (habitId: string, dateStr: string) => {
      return completions.some((r) => r.habitId === habitId && r.date === dateStr && r.completed);
    },
    [completions]
  );

  const getCompletionForDate = useCallback(
    (habitId: string, dateStr: string) => {
      return completions.find((r) => r.habitId === habitId && r.date === dateStr);
    },
    [completions]
  );

  const addHabit = useCallback(
    (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: formatLocalDate(),
      };
      setHabits((prev) => [newHabit, ...prev]);
    },
    []
  );

  const editHabit = useCallback((updatedHabit: Habit) => {
    setHabits((prev) => prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletions((prev) => prev.filter((c) => c.habitId !== id));
  }, []);

  const toggleHabitCompletion = useCallback(
    (habitId: string, targetDateStr: string = selectedDate) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const existingRecord = completions.find(
        (r) => r.habitId === habitId && r.date === targetDateStr
      );

      const isNowCompleted = !existingRecord?.completed;

      // Audio & celebratory visual feedback
      if (isNowCompleted) {
        if (settings.soundEnabled) {
          soundService.playCompleteSound();
        }
      }

      setCompletions((prev) => {
        const withoutTarget = prev.filter(
          (r) => !(r.habitId === habitId && r.date === targetDateStr)
        );

        if (isNowCompleted) {
          const newRecord: CompletionRecord = {
            habitId,
            date: targetDateStr,
            completed: true,
            currentValue: habit.targetValue || 1,
            completedAt: new Date().toISOString(),
          };
          return [...withoutTarget, newRecord];
        } else {
          // If habit has target, keep partial progress or reset to 0
          if (habit.hasTarget) {
            const resetRecord: CompletionRecord = {
              habitId,
              date: targetDateStr,
              completed: false,
              currentValue: 0,
            };
            return [...withoutTarget, resetRecord];
          }
          return withoutTarget;
        }
      });

      // Check if all scheduled habits for this day are now completed
      if (isNowCompleted) {
        const scheduledToday = habits.filter(
          (h) => !h.archived && isHabitScheduledForDate(h, targetDateStr)
        );
        const willBeCompletedCount =
          scheduledToday.filter(
            (h) =>
              h.id === habitId ||
              completions.some((c) => c.habitId === h.id && c.date === targetDateStr && c.completed)
          ).length;

        if (scheduledToday.length > 0 && willBeCompletedCount === scheduledToday.length) {
          if (settings.soundEnabled) {
            setTimeout(() => soundService.playCelebrationChord(), 350);
          }
          triggerConfetti();
        }
      }
    },
    [habits, completions, selectedDate, settings.soundEnabled, triggerConfetti]
  );

  const updateHabitProgress = useCallback(
    (habitId: string, value: number, targetDateStr: string = selectedDate) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit || !habit.hasTarget || !habit.targetValue) return;

      const clampedValue = Math.max(0, value);
      const isComplete = clampedValue >= habit.targetValue;

      if (isComplete && !isDateCompleted(habitId, targetDateStr)) {
        if (settings.soundEnabled) soundService.playCompleteSound();
      }

      setCompletions((prev) => {
        const withoutTarget = prev.filter(
          (r) => !(r.habitId === habitId && r.date === targetDateStr)
        );

        const newRecord: CompletionRecord = {
          habitId,
          date: targetDateStr,
          completed: isComplete,
          currentValue: clampedValue,
          completedAt: isComplete ? new Date().toISOString() : undefined,
        };

        return [...withoutTarget, newRecord];
      });
    },
    [habits, isDateCompleted, selectedDate, settings.soundEnabled]
  );

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetAllData = useCallback(() => {
    clearAllStorageData();
    setHabits([]);
    setCompletions([]);
  }, []);

  const restoreSampleHabits = useCallback(() => {
    const samples = getInitialSampleHabits();
    const sampleCompletions = getInitialSampleCompletions(samples);
    setHabits(samples);
    setCompletions(sampleCompletions);
    saveHabitsToStorage(samples);
    saveCompletionsToStorage(sampleCompletions);
  }, []);

  const importData = useCallback(
    (newHabits: Habit[], newCompletions: CompletionRecord[], newSettings?: UserSettings) => {
      setHabits(newHabits);
      setCompletions(newCompletions);
      if (newSettings) {
        setSettings(newSettings);
      }
    },
    []
  );

  const stats = useMemo(
    () => calculateGlobalStats(habits, completions, selectedDate),
    [habits, completions, selectedDate]
  );

  const badges = useMemo(() => computeBadges(habits, completions), [habits, completions]);

  return (
    <HabitContext.Provider
      value={{
        habits,
        completions,
        settings,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        stats,
        badges,
        addHabit,
        editHabit,
        deleteHabit,
        toggleHabitCompletion,
        updateHabitProgress,
        updateSettings,
        resetAllData,
        restoreSampleHabits,
        importData,
        triggerConfetti,
        isDateCompleted,
        getCompletionForDate,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return ctx;
}
