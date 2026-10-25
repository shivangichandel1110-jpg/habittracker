import React, { useState, useEffect } from 'react';
import { X, Clock, Target, Calendar, Sparkles } from 'lucide-react';
import { Habit, HabitCategory, FrequencyType } from '../../types';
import { ColorPicker } from '../common/ColorPicker';
import { IconPicker } from '../common/IconPicker';
import { getColorScheme } from '../../utils/iconUtils';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'> | Habit) => void;
  editingHabit?: Habit | null;
}

const CATEGORIES: { id: HabitCategory; label: string }[] = [
  { id: 'health', label: 'Health' },
  { id: 'study', label: 'Study' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'custom', label: 'Custom' },
];

const WEEK_DAYS = [
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
  { day: 0, label: 'S' },
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHabit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [color, setColor] = useState('emerald');
  const [icon, setIcon] = useState('droplets');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [targetTimesPerWeek, setTargetTimesPerWeek] = useState(3);
  const [hasTarget, setHasTarget] = useState(false);
  const [targetValue, setTargetValue] = useState<number>(8);
  const [targetUnit, setTargetUnit] = useState('glasses');
  const [reminderTime, setReminderTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category);
      setColor(editingHabit.color);
      setIcon(editingHabit.icon);
      setFrequencyType(editingHabit.frequency.type);
      setSpecificDays(editingHabit.frequency.days || [1, 2, 3, 4, 5]);
      setTargetTimesPerWeek(editingHabit.frequency.targetTimesPerWeek || 3);
      setHasTarget(editingHabit.hasTarget);
      setTargetValue(editingHabit.targetValue || 1);
      setTargetUnit(editingHabit.targetUnit || 'times');
      setReminderTime(editingHabit.reminderTime || '');
    } else {
      setName('');
      setDescription('');
      setCategory('health');
      setColor('emerald');
      setIcon('droplets');
      setFrequencyType('daily');
      setSpecificDays([1, 2, 3, 4, 5]);
      setTargetTimesPerWeek(3);
      setHasTarget(false);
      setTargetValue(8);
      setTargetUnit('glasses');
      setReminderTime('');
    }
    setError('');
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a habit name.');
      return;
    }

    if (frequencyType === 'specific_days' && specificDays.length === 0) {
      setError('Please select at least one day for this habit.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      color,
      icon,
      frequency: {
        type: frequencyType,
        days: frequencyType === 'specific_days' ? specificDays : undefined,
        targetTimesPerWeek: frequencyType === 'times_per_week' ? targetTimesPerWeek : undefined,
      },
      hasTarget,
      targetValue: hasTarget ? Number(targetValue) || 1 : undefined,
      targetUnit: hasTarget ? targetUnit.trim() || 'times' : undefined,
      reminderTime: reminderTime ? reminderTime : undefined,
    };

    if (editingHabit) {
      onSave({
        ...editingHabit,
        ...payload,
      });
    } else {
      onSave(payload);
    }
    onClose();
  };

  const activeColorScheme = getColorScheme(color);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define your daily or weekly routine to build consistency.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Habit Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g., Morning Workout, Read 15 Pages, Drink Water"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Description / Motivation (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Boost morning energy, improve focus, stay hydrated"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Icon Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Color Theme
              </label>
              <ColorPicker selectedColor={color} onSelectColor={setColor} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Habit Icon
              </label>
              <IconPicker
                selectedIcon={icon}
                onSelectIcon={setIcon}
                colorSchemeAccent={activeColorScheme.accent}
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Frequency & Schedule
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { type: 'daily', label: 'Every Day' },
                { type: 'weekdays', label: 'Weekdays' },
                { type: 'weekends', label: 'Weekends' },
                { type: 'specific_days', label: 'Custom Days' },
              ].map((freq) => (
                <button
                  key={freq.type}
                  type="button"
                  onClick={() => setFrequencyType(freq.type as FrequencyType)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                    frequencyType === freq.type
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>

            {frequencyType === 'specific_days' && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">Select active days:</span>
                <div className="flex gap-1">
                  {WEEK_DAYS.map((d) => {
                    const isSelected = specificDays.includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => toggleDay(d.day)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quantitative Target (Optional) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTarget}
                  onChange={(e) => setHasTarget(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Track Target Amount (e.g., 8 glasses)
                </span>
              </label>
            </div>

            {hasTarget && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Target Value</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="glasses, mins, pages"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Daily Reminder Time */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Reminder Time (Optional)
              </span>
            </div>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
