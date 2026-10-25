import React from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import {
  parseLocalDate,
  getWeekDays,
  addDaysToDateString,
  formatLocalDate,
  isHabitScheduledForDate,
} from '../../utils/dateUtils';

export const WeeklyStrip: React.FC = () => {
  const { selectedDate, setSelectedDate, settings, habits, completions } = useHabits();

  const currentDateObj = parseLocalDate(selectedDate);
  const weekDays = getWeekDays(currentDateObj, settings.weekStartsOn);

  const handlePrevWeek = () => {
    setSelectedDate(addDaysToDateString(selectedDate, -7));
  };

  const handleNextWeek = () => {
    setSelectedDate(addDaysToDateString(selectedDate, 7));
  };

  const handleGoToday = () => {
    setSelectedDate(formatLocalDate());
  };

  const isCurrentToday = selectedDate === formatLocalDate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Weekly Rhythm
          </h3>
          {!isCurrentToday && (
            <button
              onClick={handleGoToday}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
            >
              Back to Today
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevWeek}
            aria-label="Previous week"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            aria-label="Next week"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => {
          // Calculate completions for this day
          const scheduled = habits.filter(
            (h) => !h.archived && isHabitScheduledForDate(h, day.dateStr)
          );
          const completedCount = scheduled.filter((h) =>
            completions.some((c) => c.habitId === h.id && c.date === day.dateStr && c.completed)
          ).length;
          const totalScheduled = scheduled.length;
          const isAllDone = totalScheduled > 0 && completedCount === totalScheduled;
          const isPartial = totalScheduled > 0 && completedCount > 0 && !isAllDone;

          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex flex-col items-center justify-between py-2 px-1 sm:px-2 rounded-xl text-center transition-all cursor-pointer relative ${
                day.isSelected
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className={`text-[11px] uppercase ${day.isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {day.dayName}
              </span>
              <span className="text-sm sm:text-base font-bold my-0.5">
                {day.dayNumber}
              </span>

              {/* Status indicator dot / ring */}
              <div className="h-4 flex items-center justify-center">
                {totalScheduled === 0 ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${day.isSelected ? 'bg-emerald-300/40' : 'bg-slate-300 dark:bg-slate-700'}`} />
                ) : isAllDone ? (
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${day.isSelected ? 'bg-white text-emerald-700' : 'bg-emerald-500 text-white'}`}>
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : isPartial ? (
                  <span className={`text-[10px] font-bold ${day.isSelected ? 'text-emerald-100' : 'text-amber-600 dark:text-amber-400'}`}>
                    {completedCount}/{totalScheduled}
                  </span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${day.isSelected ? 'bg-white/40' : 'bg-slate-300 dark:bg-slate-700'}`} />
                )}
              </div>

              {day.isToday && (
                <span className={`absolute -top-1 right-1 w-2 h-2 rounded-full ${day.isSelected ? 'bg-white' : 'bg-emerald-500'}`} title="Today" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
