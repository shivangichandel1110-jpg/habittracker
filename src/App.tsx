import React, { useState } from 'react';
import { HabitProvider, useHabits } from './context/HabitContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { HabitsView } from './components/habits/HabitsView';
import { CalendarView } from './components/calendar/CalendarView';
import { StatsView } from './components/stats/StatsView';
import { GoalsView } from './components/goals/GoalsView';
import { SettingsView } from './components/settings/SettingsView';
import { HabitModal } from './components/habits/HabitModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

const AppContent: React.FC = () => {
  const { activeTab, addHabit } = useHabits();
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar onOpenNewHabitModal={() => setIsNewHabitModalOpen(true)} />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenNewHabitModal={() => setIsNewHabitModalOpen(true)} />
          )}
          {activeTab === 'habits' && (
            <HabitsView onOpenNewHabitModal={() => setIsNewHabitModalOpen(true)} />
          )}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'stats' && <StatsView />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global New Habit Modal */}
      {isNewHabitModalOpen && (
        <HabitModal
          isOpen={true}
          onClose={() => setIsNewHabitModalOpen(false)}
          onSave={(data) => {
            addHabit(data);
            setIsNewHabitModalOpen(false);
          }}
        />
      )}

      {/* First-time Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}
