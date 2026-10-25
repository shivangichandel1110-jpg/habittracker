import React from 'react';
import {
  Trophy,
  Flame,
  Zap,
  ShieldCheck,
  Crown,
  Star,
  Award,
  Compass,
  Sparkles,
  Footprints,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { soundService } from '../../utils/soundUtils';

export const GoalsView: React.FC = () => {
  const { badges, stats, triggerConfetti, settings } = useHabits();

  const unlockedCount = badges.filter((b) => b.unlockedAt).length;

  const handleTestCelebrate = () => {
    if (settings.soundEnabled) soundService.playCelebrationChord();
    triggerConfetti();
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'footprints':
        return <Footprints className="w-6 h-6" />;
      case 'flame':
        return <Flame className="w-6 h-6" />;
      case 'zap':
        return <Zap className="w-6 h-6" />;
      case 'shield-check':
        return <ShieldCheck className="w-6 h-6" />;
      case 'crown':
        return <Crown className="w-6 h-6" />;
      case 'star':
        return <Star className="w-6 h-6" />;
      case 'award':
        return <Award className="w-6 h-6" />;
      case 'compass':
        return <Compass className="w-6 h-6" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent p-6 rounded-3xl border border-amber-500/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Goals & Milestones
            </h1>
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {unlockedCount} of {badges.length} milestone badges unlocked!
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every step you take reinforces your identity as someone who shows up.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestCelebrate}
          className="flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Progress!</span>
        </button>
      </div>

      {/* Weekly Goal Target Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Weekly Habit Goal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete your daily routines to hit your weekly target
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {stats.completedTodayCount} Completed Today
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, stats.todayPercentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>0%</span>
          <span>Today's Target: {stats.scheduledTodayCount} habits ({stats.todayPercentage}%)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Milestone Badges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/40 shadow-xs ring-1 ring-amber-400/20'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform ${
                      isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? getBadgeIcon(badge.icon) : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {badge.title}
                      </h4>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar towards unlock */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Target: {badge.targetRequirement}</span>
                    <span className="font-semibold">{badge.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUnlocked ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gentle Habit Philosophy Note */}
      <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 p-5 space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>The Gentle Habit Philosophy</span>
        </div>
        <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
          Missing a day is not a failure — it is simply human life happening. Research in behavioral psychology shows that missing an occasional day has virtually zero impact on long-term habit formation. What matters is gently recommencing the next day with self-compassion.
        </p>
      </div>
    </div>
  );
};
