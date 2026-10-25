import React, { useState, useRef } from 'react';
import {
  User,
  Sun,
  Moon,
  Laptop,
  Calendar,
  Bell,
  Volume2,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  exportDataAsJSON,
  exportCompletionsAsCSV,
  parseAndValidateImportJSON,
} from '../../utils/storage';
import { soundService } from '../../utils/soundUtils';

export const SettingsView: React.FC = () => {
  const {
    habits,
    completions,
    settings,
    updateSettings,
    resetAllData,
    restoreSampleHabits,
    importData,
    triggerConfetti,
  } = useHabits();

  const [nameInput, setNameInput] = useState(settings.userName);
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [notificationFeedback, setNotificationFeedback] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateSettings({ userName: nameInput.trim() });
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationFeedback('Browser notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        updateSettings({ reminderEnabled: true });
        setNotificationFeedback('Notification permission granted!');
        new Notification('HabitFlow Reminders Enabled', {
          body: 'Great! You will receive timely nudges to maintain your positive routines.',
          icon: '/favicon.ico',
        });
      } else if (permission === 'denied') {
        updateSettings({ reminderEnabled: false });
        setNotificationFeedback('Permission was denied in your browser settings.');
      }
    } catch (err) {
      setNotificationFeedback('Failed to request notification permission.');
    }
  };

  const handleTestChime = () => {
    soundService.playCompleteSound();
  };

  const handleExportJSON = () => {
    exportDataAsJSON(habits, completions, settings);
  };

  const handleExportCSV = () => {
    exportCompletionsAsCSV(habits, completions);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateImportJSON(content);
      if (res.success && res.data) {
        importData(res.data.habits, res.data.completions, res.data.settings);
        setImportStatus({
          success: true,
          message: res.message,
        });
        triggerConfetti();
      } else {
        setImportStatus({
          success: false,
          message: res.message,
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Preferences & Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your workspace, audio feedback, export/import data backups, and configure schedules.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              User Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize greetings and dashboard stats
            </p>
          </div>
        </div>

        <form onSubmit={handleNameSave} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your Name (e.g. Alex)"
            className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            Update Name
          </button>
        </form>
      </div>

      {/* Appearance & Calendar Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Appearance & Layout
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Theme colors and calendar display options
            </p>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Interface Theme
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((th) => {
              const Icon = th.icon;
              const isSelected = settings.theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => updateSettings({ theme: th.id as 'light' | 'dark' | 'system' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Week Start Day */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            First Day of the Week
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ weekStartsOn: 1 })}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                settings.weekStartsOn === 1
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Monday (Standard)
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ weekStartsOn: 0 })}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                settings.weekStartsOn === 0
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Sunday
            </button>
          </div>
        </div>
      </div>

      {/* Notifications & Audio Feedback */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Reminders & Feedback
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browser alerts, completion sound, and confetti celebrations
            </p>
          </div>
        </div>

        {/* Browser Notifications Explanation & Button */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Browser Reminder Notifications
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Status: <span className="font-semibold uppercase">{notificationStatus}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestNotificationPermission}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            >
              {notificationStatus === 'granted' ? 'Notifications Active' : 'Request Permission'}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
            ⚠️ <strong>Important note:</strong> Browser notifications require user permission and cannot be guaranteed when the app or browser tab is completely closed, unless a dedicated Push Notification service worker is connected.
          </p>

          {notificationFeedback && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {notificationFeedback}
            </p>
          )}
        </div>

        {/* Audio Chime and Confetti Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Audio Chime on Completion
                </p>
                <p className="text-[11px] text-slate-500">
                  Synthesized harmonic bell chime upon fulfilling a habit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestChime}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Test sound
              </button>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Celebration Confetti
                </p>
                <p className="text-[11px] text-slate-500">
                  Show celebratory confetti when finishing all scheduled habits
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.celebrationEnabled}
              onChange={(e) => updateSettings({ celebrationEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Backup, Export & Import */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Data Backup & Restore
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export your records to JSON or spreadsheet CSV, or import from backup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors cursor-pointer"
          >
            <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Export Full Backup (JSON)
              </p>
              <p className="text-[11px] text-slate-400">
                Complete habits, settings and history backup
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-left transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Export History (CSV)
              </p>
              <p className="text-[11px] text-slate-400">
                Spreadsheet format for Excel or Google Sheets
              </p>
            </div>
          </button>
        </div>

        {/* Import JSON */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Backup JSON File
          </button>

          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone: Restore Samples & Reset Data */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-rose-800 dark:text-rose-300">
            Reset & Sample Management
          </h2>
          <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-0.5">
            Safely reset your workspace or restore sample habits
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRestoreConfirmOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            Reload Sample Habits
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs cursor-pointer"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isRestoreConfirmOpen}
        title="Reload Sample Habits"
        message="This will overwrite current habits with the standard sample set (Drinking water, Study, Workout, Reading, Sleep, Meditation) and initial history. Do you wish to continue?"
        confirmText="Reload Samples"
        cancelText="Cancel"
        onConfirm={() => {
          restoreSampleHabits();
          setIsRestoreConfirmOpen(false);
          triggerConfetti();
        }}
        onCancel={() => setIsRestoreConfirmOpen(false)}
      />

      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset All App Data"
        message="Are you completely sure? This will permanently delete all your habits, completed check-offs, streaks, and preferences from this browser. This cannot be undone."
        confirmText="Permanently Erase All"
        cancelText="Keep Data"
        isDestructive={true}
        onConfirm={() => {
          resetAllData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
