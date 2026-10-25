import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Trophy,
  Settings,
  Sparkles,
  Flame,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { ActiveTab } from '../../types';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, habits, stats, settings, updateSettings } = useHabits();

  const activeHabitsCount = habits.filter((h) => !h.archived).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'habits', label: 'My Habits', icon: CheckSquare, badgeCount: activeHabitsCount },
    { id: 'calendar', label: 'Calendar & Heatmap', icon: Calendar },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
    { id: 'goals', label: 'Goals & Badges', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const cycleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    updateSettings({ theme: nextTheme });
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 p-5 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-1 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
              HabitFlow
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Smart Habit Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badgeCount !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Quick Streak Info */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Best Streak</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {stats.bestCurrentStreak}d active
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {stats.completedTodayCount} of {stats.scheduledTodayCount} done today ({stats.todayPercentage}%)
          </div>
        </div>

        {/* User profile & Theme toggle */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {settings.userName ? settings.userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                {settings.userName || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 capitalize">{settings.theme} mode</p>
            </div>
          </div>

          <button
            onClick={cycleTheme}
            title={`Current theme: ${settings.theme}. Click to switch.`}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {settings.theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : settings.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Laptop className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
