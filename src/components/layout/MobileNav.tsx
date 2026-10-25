import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Trophy,
  Settings,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { ActiveTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, habits } = useHabits();

  const activeCount = habits.filter((h) => !h.archived).length;

  const items: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'goals', label: 'Badges', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {item.id === 'habits' && activeCount > 0 && !isActive && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
