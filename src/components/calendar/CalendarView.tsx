import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Circle,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { ActivityHeatmap } from './ActivityHeatmap';
import {
  getCalendarGrid,
  formatLocalDate,
  formatDisplayDate,
  isHabitScheduledForDate,
  parseLocalDate,
} from '../../utils/dateUtils';
import { renderHabitIcon, getColorScheme } from '../../utils/iconUtils';

export const CalendarView: React.FC = () => {
  const {
    habits,
    completions,
    settings,
    selectedDate,
    setSelectedDate,
    toggleHabitCompletion,
  } = useHabits();

  const [currentYear, setCurrentYear] = useState<number>(() => {
    return new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return new Date().getMonth();
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(formatLocalDate());
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const grid = getCalendarGrid(currentYear, currentMonth, settings.weekStartsOn);

  // Weekday headers
  const weekdayNames = settings.weekStartsOn === 1
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Scheduled habits for currently selected date
  const selectedDayHabits = habits.filter(
    (h) => !h.archived && isHabitScheduledForDate(h, selectedDate)
  );

  const selectedDayCompletedHabits = selectedDayHabits.filter((h) =>
    completions.some((c) => c.habitId === h.id && c.date === selectedDate && c.completed)
  );

  const selectedDayMissedHabits = selectedDayHabits.filter(
    (h) => !completions.some((c) => c.habitId === h.id && c.date === selectedDate && c.completed)
  );

  // Total consistency stats for the month
  let monthCompletedTotal = 0;
  let monthScheduledTotal = 0;
  let perfectDaysCount = 0;

  grid.forEach((cell) => {
    if (cell.isCurrentMonth && cell.dateStr <= formatLocalDate()) {
      const scheduled = habits.filter(
        (h) => !h.archived && isHabitScheduledForDate(h, cell.dateStr)
      );
      if (scheduled.length > 0) {
        monthScheduledTotal += scheduled.length;
        const done = scheduled.filter((h) =>
          completions.some((c) => c.habitId === h.id && c.date === cell.dateStr && c.completed)
        ).length;
        monthCompletedTotal += done;
        if (done === scheduled.length) perfectDaysCount++;
      }
    }
  });

  const monthRate = monthScheduledTotal > 0
    ? Math.round((monthCompletedTotal / monthScheduledTotal) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Calendar & Habit History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Navigate through past months, inspect consistency, and view habit details by date.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToday}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs cursor-pointer"
        >
          Jump to Today
        </button>
      </div>

      {/* GitHub-style Heatmap */}
      <ActivityHeatmap completions={completions} weeks={18} />

      {/* Main Calendar & Day Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
          {/* Calendar Header with Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {monthName}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {monthRate}% completed
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdayNames.map((name) => (
              <div
                key={name}
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {grid.map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const scheduled = habits.filter(
                (h) => !h.archived && isHabitScheduledForDate(h, cell.dateStr)
              );
              const completedCount = scheduled.filter((h) =>
                completions.some((c) => c.habitId === h.id && c.date === cell.dateStr && c.completed)
              ).length;
              const totalScheduled = scheduled.length;
              const isAllDone = totalScheduled > 0 && completedCount === totalScheduled;
              const isPartial = totalScheduled > 0 && completedCount > 0 && !isAllDone;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                      : cell.isCurrentMonth
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-transparent text-slate-300 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        cell.isToday
                          ? 'w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]'
                          : !cell.isCurrentMonth
                          ? 'opacity-40'
                          : ''
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {isAllDone && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Day Progress info */}
                  {totalScheduled > 0 && cell.isCurrentMonth && (
                    <div className="w-full">
                      <div className="flex items-center justify-between text-[10px] mb-1 font-medium">
                        <span className={isAllDone ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
                          {completedCount}/{totalScheduled}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isAllDone
                              ? 'bg-emerald-500'
                              : isPartial
                              ? 'bg-amber-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                          style={{
                            width: `${(completedCount / totalScheduled) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Month Summary Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>{monthCompletedTotal} completed this month</span>
              <span>·</span>
              <span>{perfectDaysCount} perfect days</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                All Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Partial
              </span>
            </div>
          </div>
        </div>

        {/* Selected Date Inspector Sidebar (1 col on desktop) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Selected Day
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {formatDisplayDate(selectedDate)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedDate} · {selectedDayCompletedHabits.length} of {selectedDayHabits.length} completed
              </p>
            </div>

            {/* List of Habits for Selected Date */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayHabits.length > 0 ? (
                selectedDayHabits.map((habit) => {
                  const isDone = completions.some(
                    (c) => c.habitId === habit.id && c.date === selectedDate && c.completed
                  );
                  const scheme = getColorScheme(habit.color);

                  return (
                    <div
                      key={habit.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${scheme.bgLight} ${scheme.bgDark} ${scheme.textLight} ${scheme.textDark}`}
                        >
                          {renderHabitIcon(habit.icon, { className: 'w-4 h-4' })}
                        </div>
                        <div className="truncate">
                          <p className={`text-xs font-semibold truncate ${isDone ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                            {habit.name}
                          </p>
                          <p className="text-[11px] text-slate-400 capitalize">
                            {habit.category} {habit.targetValue ? `· Target: ${habit.targetValue} ${habit.targetUnit}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Interactive toggle directly from calendar! */}
                      <button
                        type="button"
                        onClick={() => toggleHabitCompletion(habit.id, selectedDate)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-400 hover:text-emerald-600 border border-slate-200 dark:border-slate-600'
                        }`}
                        title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        <Check className={`w-4 h-4 ${isDone ? 'stroke-[2.5]' : 'opacity-40'}`} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 space-y-1">
                  <p>No habits scheduled for this day.</p>
                  <p className="text-[11px]">Click any date on the calendar to see that day’s routines.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick info tip */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            💡 You can click the checkmark on any habit above to retroactively update records for this day.
          </div>
        </div>
      </div>
    </div>
  );
};
