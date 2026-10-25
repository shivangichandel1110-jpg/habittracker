import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  PieChart as PieIcon,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { calculateHabitStreak } from '../../utils/streakUtils';
import {
  formatLocalDate,
  addDaysToDateString,
  parseLocalDate,
  isHabitScheduledForDate,
} from '../../utils/dateUtils';
import { getColorScheme, renderHabitIcon } from '../../utils/iconUtils';

export const StatsView: React.FC = () => {
  const { habits, completions, settings } = useHabits();
  const [trendRange, setTrendRange] = useState<7 | 14 | 30>(14);

  const activeHabits = useMemo(() => habits.filter((h) => !h.archived), [habits]);

  // 1. Completion Trend over selected range (7, 14, 30 days)
  const trendData = useMemo(() => {
    const today = formatLocalDate();
    const data = [];

    for (let i = trendRange - 1; i >= 0; i--) {
      const dateStr = addDaysToDateString(today, -i);
      const scheduled = activeHabits.filter((h) => isHabitScheduledForDate(h, dateStr));
      const completedCount = scheduled.filter((h) =>
        completions.some((c) => c.habitId === h.id && c.date === dateStr && c.completed)
      ).length;

      const rate = scheduled.length > 0 ? Math.round((completedCount / scheduled.length) * 100) : 0;
      const d = parseLocalDate(dateStr);
      const shortLabel = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

      data.push({
        date: dateStr,
        label: shortLabel,
        rate,
        completed: completedCount,
        scheduled: scheduled.length,
      });
    }

    return data;
  }, [activeHabits, completions, trendRange]);

  // Average completion rate in selected trend range
  const averageTrendRate = useMemo(() => {
    if (trendData.length === 0) return 0;
    const sum = trendData.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sum / trendData.length);
  }, [trendData]);

  // 2. Day-of-the-week consistency (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  const dayOfWeekStats = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const totals = [0, 0, 0, 0, 0, 0, 0];

    // Look over the past 60 days
    const today = formatLocalDate();
    for (let i = 0; i < 60; i++) {
      const dateStr = addDaysToDateString(today, -i);
      const d = parseLocalDate(dateStr);
      const dayIdx = d.getDay();

      const scheduled = activeHabits.filter((h) => isHabitScheduledForDate(h, dateStr));
      if (scheduled.length > 0) {
        totals[dayIdx] += scheduled.length;
        const done = scheduled.filter((h) =>
          completions.some((c) => c.habitId === h.id && c.date === dateStr && c.completed)
        ).length;
        counts[dayIdx] += done;
      }
    }

    // Reorder based on weekStartsOn
    const order = settings.weekStartsOn === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6];

    return order.map((idx) => {
      const rate = totals[idx] > 0 ? Math.round((counts[idx] / totals[idx]) * 100) : 0;
      return {
        day: dayNames[idx],
        rate,
        completed: counts[idx],
        total: totals[idx],
      };
    });
  }, [activeHabits, completions, settings.weekStartsOn]);

  // 3. Habit-by-habit performance table and streak leaderboard
  const habitPerformances = useMemo(() => {
    return activeHabits
      .map((habit) => {
        const s = calculateHabitStreak(habit, completions);
        const scheme = getColorScheme(habit.color);
        return {
          id: habit.id,
          name: habit.name,
          category: habit.category,
          icon: habit.icon,
          color: habit.color,
          accent: scheme.accent,
          currentStreak: s.currentStreak,
          longestStreak: s.longestStreak,
          totalCompletions: s.totalCompletions,
          completionRate: s.completionRate,
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate);
  }, [activeHabits, completions]);

  // Best performing habit
  const topHabit = habitPerformances[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Analytics & Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore your completion consistency, streak milestones, and peak performance days.
        </p>
      </div>

      {/* Top 3 Metric Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg. Completion Rate
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {averageTrendRate}%
            </p>
            <p className="text-xs text-slate-500">Over past {trendRange} days</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Top Routine
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {topHabit ? topHabit.name : 'No habits yet'}
            </p>
            <p className="text-xs text-slate-500">
              {topHabit ? `${topHabit.completionRate}% consistency` : 'Add habits to track'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
            <Flame className="w-6 h-6 fill-indigo-500/20" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Completions
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {completions.filter((c) => c.completed).length}
            </p>
            <p className="text-xs text-slate-500">All-time habits fulfilled</p>
          </div>
        </div>
      </div>

      {/* Completion Trend Area Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Completion Rate Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily percentage of scheduled habits completed
            </p>
          </div>

          {/* Range segmented buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTrendRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  trendRange === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {r} Days
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                className="text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                className="text-slate-400"
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-2 rounded-xl text-xs shadow-lg space-y-0.5">
                        <p className="font-semibold">{data.date}</p>
                        <p className="text-emerald-400 dark:text-emerald-600 font-bold">
                          {data.rate}% completed
                        </p>
                        <p className="text-slate-400 dark:text-slate-600 text-[11px]">
                          {data.completed} of {data.scheduled} habits fulfilled
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#emeraldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Day of Week & Performance Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day of Week Breakdown (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Peak Consistency Days
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Historical completion rate by day of week
            </p>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-xl text-xs shadow-md">
                          <p className="font-bold">{data.day}</p>
                          <p>{data.rate}% avg consistency</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  {dayOfWeekStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rate >= 75 ? '#10b981' : entry.rate >= 50 ? '#14b8a6' : '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit-Wise Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Habit Performance Leaderboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by overall consistency and active streak
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
            {habitPerformances.map((hp, rank) => (
              <div key={hp.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400 w-4 text-right">
                    #{rank + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${hp.accent}15`, color: hp.accent }}
                  >
                    {renderHabitIcon(hp.icon, { className: 'w-4 h-4' })}
                  </div>
                  <div className="truncate">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {hp.name}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {hp.category} · {hp.totalCompletions} total logs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0 text-right">
                  {/* Streak */}
                  <div className="hidden sm:block">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {hp.currentStreak}d
                    </span>
                    <span className="text-[10px] text-slate-400">best {hp.longestStreak}d</span>
                  </div>

                  {/* Consistency Progress Bar */}
                  <div className="w-20 sm:w-28 space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">
                        {hp.completionRate}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${hp.completionRate}%`,
                          backgroundColor: hp.accent,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
