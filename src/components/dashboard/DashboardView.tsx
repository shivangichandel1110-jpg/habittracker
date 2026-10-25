import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Layers,
  Smile,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { ProgressRing } from './ProgressRing';
import { WeeklyStrip } from './WeeklyStrip';
import { HabitCard } from '../habits/HabitCard';
import { HabitModal } from '../habits/HabitModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { Habit, HabitCategory } from '../../types';
import {
  formatLocalDate,
  formatDisplayDate,
  formatFullGreetingDate,
  isHabitScheduledForDate,
} from '../../utils/dateUtils';
import { getMotivationalMessage } from '../../utils/badgeUtils';

interface DashboardViewProps {
  onOpenNewHabitModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenNewHabitModal }) => {
  const {
    habits,
    completions,
    settings,
    selectedDate,
    stats,
    deleteHabit,
    editHabit,
    restoreSampleHabits,
  } = useHabits();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  // Time-of-day greeting
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Filter scheduled habits for the selected date
  const scheduledForSelectedDate = habits.filter(
    (h) => !h.archived && isHabitScheduledForDate(h, selectedDate)
  );

  // Apply category and completion filters
  const filteredHabits = scheduledForSelectedDate.filter((h) => {
    if (filterCategory !== 'all' && h.category !== filterCategory) return false;

    const isDone = completions.some(
      (c) => c.habitId === h.id && c.date === selectedDate && c.completed
    );

    if (filterStatus === 'pending' && isDone) return false;
    if (filterStatus === 'completed' && !isDone) return false;

    return true;
  });

  const motivation = getMotivationalMessage(
    stats.todayPercentage,
    stats.completedTodayCount,
    stats.scheduledTodayCount
  );

  const isToday = selectedDate === formatLocalDate();
  const dateLabel = formatDisplayDate(selectedDate);

  const habitToDelete = habits.find((h) => h.id === deletingHabitId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6 rounded-3xl border border-emerald-500/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {timeGreeting}, {settings.userName || 'Alex'}!
            </h1>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {motivation.headline}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {motivation.subtitle}
          </p>
        </div>

        {/* Quick Date Display */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isToday ? 'Today' : dateLabel}
            </p>
            <p className="text-[11px] text-slate-400">
              {formatFullGreetingDate(new Date(selectedDate + 'T12:00:00'))}
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Today's Completion Progress Ring */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completion Rate
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.todayPercentage}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stats.completedTodayCount} of {stats.scheduledTodayCount} scheduled
            </p>
          </div>
          <ProgressRing
            percentage={stats.todayPercentage}
            completed={stats.completedTodayCount}
            total={stats.scheduledTodayCount}
            size={76}
            strokeWidth={7}
          />
        </div>

        {/* Card 2: Completed Today */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.completedTodayCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Habits fulfilled
            </p>
          </div>
        </div>

        {/* Card 3: Best Active Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Best Streak
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-baseline gap-1">
              <span>{stats.bestCurrentStreak}</span>
              <span className="text-xs font-normal text-slate-500">days</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All-time peak: {stats.bestLongestStreak} days
            </p>
          </div>
        </div>

        {/* Card 4: Total Active Habits */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Habits
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.activeHabitsCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {stats.totalCompletionsAllTime} total logs all time
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Rhythm Strip */}
      <WeeklyStrip />

      {/* Habits List Section */}
      <div className="space-y-4">
        {/* Section Header with Category & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isToday ? "Today's Habits" : `Habits for ${dateLabel}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {scheduledForSelectedDate.length} habit{scheduledForSelectedDate.length !== 1 ? 's' : ''} scheduled for this day
            </p>
          </div>

          {/* Interactive filter buttons (allowed by frontend design constitution) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'pending'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  filterStatus === 'completed'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Habit Cards Grid */}
        {filteredHabits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                targetDate={selectedDate}
                onEdit={(h) => setEditingHabit(h)}
                onDelete={(id) => setDeletingHabitId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Smile className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {scheduledForSelectedDate.length === 0
                  ? 'No habits scheduled for this day'
                  : 'No habits match your active filter'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {scheduledForSelectedDate.length === 0
                  ? 'Take a mindful rest, or add a daily habit to keep your positive momentum going.'
                  : 'Try selecting "All" or check off a new habit.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenNewHabitModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Habit
              </button>
              {habits.length === 0 && (
                <button
                  type="button"
                  onClick={restoreSampleHabits}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Load Sample Habits
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingHabit && (
        <HabitModal
          isOpen={true}
          editingHabit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={(updated) => {
            editHabit(updated as Habit);
            setEditingHabit(null);
          }}
        />
      )}

      {/* Confirmation Modal for deletion */}
      <ConfirmationModal
        isOpen={!!deletingHabitId}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.name || 'this habit'}"? All completion history and streak data for this habit will also be permanently removed.`}
        confirmText="Delete Habit"
        cancelText="Keep Habit"
        isDestructive={true}
        onConfirm={() => {
          if (deletingHabitId) {
            deleteHabit(deletingHabitId);
            setDeletingHabitId(null);
          }
        }}
        onCancel={() => setDeletingHabitId(null)}
      />
    </div>
  );
};
