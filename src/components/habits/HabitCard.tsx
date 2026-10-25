import React, { useState } from 'react';
import {
  Check,
  Flame,
  MoreVertical,
  Edit2,
  Trash2,
  Clock,
  Plus,
  Minus,
} from 'lucide-react';
import { Habit } from '../../types';
import { useHabits } from '../../context/HabitContext';
import { renderHabitIcon, getColorScheme } from '../../utils/iconUtils';
import { calculateHabitStreak } from '../../utils/streakUtils';
import { addDaysToDateString, formatLocalDate, isHabitScheduledForDate } from '../../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  targetDate: string;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  targetDate,
  onEdit,
  onDelete,
}) => {
  const { completions, toggleHabitCompletion, updateHabitProgress } = useHabits();
  const [showMenu, setShowMenu] = useState(false);

  const streak = calculateHabitStreak(habit, completions, targetDate);
  const colorScheme = getColorScheme(habit.color);

  const isScheduled = isHabitScheduledForDate(habit, targetDate);
  const completionRecord = completions.find(
    (c) => c.habitId === habit.id && c.date === targetDate
  );
  const isCompleted = !!completionRecord?.completed;
  const currentValue = completionRecord?.currentValue ?? (isCompleted ? habit.targetValue || 1 : 0);

  const handleToggle = () => {
    toggleHabitCompletion(habit.id, targetDate);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!habit.targetValue) return;
    const nextVal = (currentValue || 0) + 1;
    updateHabitProgress(habit.id, nextVal, targetDate);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!habit.targetValue) return;
    const nextVal = Math.max(0, (currentValue || 0) - 1);
    updateHabitProgress(habit.id, nextVal, targetDate);
  };

  // Last 7 days history dots
  const last7Days: { dateStr: string; completed: boolean; scheduled: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = addDaysToDateString(targetDate, -i);
    const sched = isHabitScheduledForDate(habit, dStr);
    const comp = completions.some((c) => c.habitId === habit.id && c.date === dStr && c.completed);
    last7Days.push({ dateStr: dStr, completed: comp, scheduled: sched });
  }

  // Format frequency label
  const frequencyLabel = (() => {
    switch (habit.frequency.type) {
      case 'daily':
        return 'Every day';
      case 'weekdays':
        return 'Weekdays';
      case 'weekends':
        return 'Weekends';
      case 'specific_days':
        return 'Custom days';
      case 'times_per_week':
        return `${habit.frequency.targetTimesPerWeek || 3}x / week`;
      default:
        return 'Daily';
    }
  })();

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-900/50 shadow-xs'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col justify-between h-full gap-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Habit Icon Circle */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${colorScheme.bgLight} ${colorScheme.bgDark} ${colorScheme.textLight} ${colorScheme.textDark}`}
            >
              {renderHabitIcon(habit.icon, { className: 'w-5 h-5' })}
            </div>

            {/* Title & Metadata */}
            <div>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-base font-semibold leading-snug transition-colors ${
                    isCompleted
                      ? 'text-slate-900 dark:text-slate-100'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {habit.name}
                </h4>
              </div>

              {habit.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {habit.description}
                </p>
              )}

              {/* Clean metadata without pill capsules (anti-slop rule) */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
                <span className="capitalize">{habit.category}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>{frequencyLabel}</span>
                {habit.reminderTime && (
                  <>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {habit.reminderTime}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action: Menu & Checkbox */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* More Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Habit options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(habit);
                      }}
                      className="w-full px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Habit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(habit.id);
                      }}
                      className="w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Habit
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Big Checkbox Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-xs scale-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 hover:scale-105 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Check className={`w-5 h-5 transition-transform stroke-[2.5] ${isCompleted ? 'scale-100' : 'scale-75 opacity-40'}`} />
            </button>
          </div>
        </div>

        {/* Target Counter (if quantitative target) */}
        {habit.hasTarget && habit.targetValue && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Goal: {currentValue} / {habit.targetValue} {habit.targetUnit}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={currentValue <= 0}
                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                  title="Decrease progress"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Increase progress"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((currentValue / habit.targetValue) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer: Streaks & Mini 7-day history */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {/* Streak Indicator */}
          <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
            <Flame
              className={`w-3.5 h-3.5 ${
                streak.currentStreak > 0
                  ? 'text-amber-500 fill-amber-500 animate-pulse'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {streak.currentStreak}d
            </span>
            <span className="text-slate-400 text-[11px]">(best {streak.longestStreak}d)</span>
          </div>

          {/* Last 7 Days Mini History Bubbles */}
          <div className="flex items-center gap-1">
            {last7Days.map((day) => (
              <span
                key={day.dateStr}
                title={`${day.dateStr}: ${day.completed ? 'Completed' : day.scheduled ? 'Missed / Pending' : 'Not scheduled'}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  day.completed
                    ? 'bg-emerald-500'
                    : day.scheduled
                    ? 'bg-slate-200 dark:bg-slate-700'
                    : 'bg-transparent border border-slate-200 dark:border-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
