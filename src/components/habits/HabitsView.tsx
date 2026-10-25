import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { HabitCard } from './HabitCard';
import { HabitModal } from './HabitModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { Habit, HabitCategory } from '../../types';
import { formatLocalDate } from '../../utils/dateUtils';

interface HabitsViewProps {
  onOpenNewHabitModal: () => void;
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Habits' },
  { id: 'health', label: 'Health' },
  { id: 'study', label: 'Study' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'productivity', label: 'Productivity' },
];

export const HabitsView: React.FC<HabitsViewProps> = ({ onOpenNewHabitModal }) => {
  const {
    habits,
    completions,
    selectedDate,
    deleteHabit,
    editHabit,
    restoreSampleHabits,
  } = useHabits();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  // Filter habits
  const filteredHabits = habits.filter((habit) => {
    if (habit.archived) return false;

    // Search filter
    if (
      searchQuery.trim() &&
      !habit.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !habit.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (activeCategory !== 'all' && habit.category !== activeCategory) {
      return false;
    }

    // Status filter for today
    const isCompletedToday = completions.some(
      (c) => c.habitId === habit.id && c.date === selectedDate && c.completed
    );

    if (statusFilter === 'completed' && !isCompletedToday) return false;
    if (statusFilter === 'pending' && isCompletedToday) return false;

    return true;
  });

  const habitToDelete = habits.find((h) => h.id === deletingHabitId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            My Habits
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your daily routines, schedules, targets, and track consistency.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={restoreSampleHabits}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Reload popular pre-configured sample habits"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Load Sample Habits</span>
            <span className="sm:hidden">Samples</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewHabitModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits by title or keyword..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start md:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Cards Grid */}
      {filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No habits found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {searchQuery || activeCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search query or reset your filters.'
                : 'You have no active habits yet. Create your first routine or load popular presets!'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenNewHabitModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </button>
            <button
              type="button"
              onClick={restoreSampleHabits}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Load Sample Habits
            </button>
          </div>
        </div>
      )}

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

      {/* Confirmation Modal for delete */}
      <ConfirmationModal
        isOpen={!!deletingHabitId}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habitToDelete?.name || 'this habit'}"? All completion history and streak data will be permanently erased.`}
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
