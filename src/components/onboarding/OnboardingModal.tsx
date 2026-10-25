import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

export const OnboardingModal: React.FC = () => {
  const { settings, updateSettings, triggerConfetti } = useHabits();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(settings.userName || '');

  // If already completed, don't show
  if (settings.onboardingCompleted) return null;

  const handleFinish = () => {
    updateSettings({
      userName: name.trim() || 'Alex',
      onboardingCompleted: true,
    });
    triggerConfetti();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>STEP {step} OF 2</span>
          <div className="flex gap-1.5">
            <span className={`w-6 h-1.5 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
            <span className={`w-6 h-1.5 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome to HabitFlow
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Your mindful daily routine companion designed to cultivate positive habits, track streaks, and maintain consistency.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                You’re Ready to Flow!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                We've pre-loaded a few popular daily routines (drinking water, reading, deep work, workouts) to get you started. You can easily edit, customize, or add your own anytime!
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Daily progress ring & streak tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>GitHub-style consistency heatmap & calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Milestone achievement badges</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open My Dashboard</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
