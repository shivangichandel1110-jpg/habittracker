import React from 'react';
import {
  Sparkles,
  Flame,
  Moon,
  Sun,
  Plus,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { formatFullGreetingDate } from '../../utils/dateUtils';

interface NavbarProps {
  onOpenNewHabitModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewHabitModal }) => {
  const { settings, updateSettings, stats } = useHabits();

  const cycleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const currentDateDisplay = formatFullGreetingDate();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile Brand & Desktop Date Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">
              HabitFlow
            </span>
          </div>

          <div className="hidden lg:block">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {currentDateDisplay}
            </span>
          </div>
        </div>

        {/* Right side action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Streak indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{stats.bestCurrentStreak} Day Streak</span>
          </div>

          {/* Today Done Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{stats.completedTodayCount}/{stats.scheduledTodayCount} Done</span>
          </div>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {settings.theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : settings.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Add Habit CTA button */}
          <button
            onClick={onOpenNewHabitModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Habit</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
