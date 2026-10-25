import React, { useState } from 'react';
import { CompletionRecord } from '../../types';
import {
  formatLocalDate,
  addDaysToDateString,
  parseLocalDate,
  formatDisplayDate,
} from '../../utils/dateUtils';

interface ActivityHeatmapProps {
  completions: CompletionRecord[];
  weeks?: number; // default 16 weeks (112 days)
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ completions, weeks = 16 }) => {
  const [hoveredDay, setHoveredDay] = useState<{ dateStr: string; count: number } | null>(null);

  // Group completions count by date
  const countsByDate = new Map<string, number>();
  for (const c of completions) {
    if (c.completed) {
      countsByDate.set(c.date, (countsByDate.get(c.date) || 0) + 1);
    }
  }

  // Generate grid columns (weeks)
  const todayStr = formatLocalDate();
  const totalDays = weeks * 7;
  const startDateStr = addDaysToDateString(todayStr, -(totalDays - 1));

  // Build array of days
  const days: { dateStr: string; count: number; dayOfWeek: number }[] = [];
  let cur = startDateStr;
  while (cur <= todayStr) {
    const d = parseLocalDate(cur);
    days.push({
      dateStr: cur,
      count: countsByDate.get(cur) || 0,
      dayOfWeek: d.getDay(), // 0 = Sun, 1 = Mon ...
    });
    cur = addDaysToDateString(cur, 1);
  }

  // Group into columns of 7 days (Sunday to Saturday or Monday to Sunday)
  const columns: { dateStr: string; count: number }[][] = [];
  let currentColumn: { dateStr: string; count: number }[] = [];

  days.forEach((day, idx) => {
    currentColumn.push(day);
    if (currentColumn.length === 7 || idx === days.length - 1) {
      columns.push(currentColumn);
      currentColumn = [];
    }
  });

  // Calculate intensity color
  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/80';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/60';
    if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count <= 5) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Consistency Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily activity over the past {weeks} weeks
          </p>
        </div>

        {/* Hovered Tooltip preview */}
        <div className="h-5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          {hoveredDay ? (
            <span>
              <strong>{hoveredDay.count} habit{hoveredDay.count !== 1 ? 's' : ''}</strong> on {formatDisplayDate(hoveredDay.dateStr)} ({hoveredDay.dateStr})
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">Hover over any day to inspect</span>
          )}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-[500px]">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1.5 flex-1">
              {col.map((day) => (
                <div
                  key={day.dateStr}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-full aspect-square rounded-sm sm:rounded-md transition-all cursor-pointer ${getIntensityClass(
                    day.count
                  )} ${
                    hoveredDay?.dateStr === day.dateStr
                      ? 'ring-2 ring-slate-800 dark:ring-white scale-125 z-10'
                      : 'hover:opacity-80'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-1">
        <span>Past {weeks} weeks</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800/80" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900/60" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
