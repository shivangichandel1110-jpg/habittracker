import { Habit, CompletionRecord, UserSettings } from '../types';
import { DEFAULT_SETTINGS, getInitialSampleHabits, getInitialSampleCompletions } from './sampleData';

const STORAGE_KEYS = {
  HABITS: 'habitflow_habits_v1',
  COMPLETIONS: 'habitflow_completions_v1',
  SETTINGS: 'habitflow_settings_v1',
};

export function loadHabitsFromStorage(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      const initial = getInitialSampleHabits();
      saveHabitsToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load habits from localStorage', err);
    return getInitialSampleHabits();
  }
}

export function saveHabitsToStorage(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (err) {
    console.error('Failed to save habits to localStorage', err);
  }
}

export function loadCompletionsFromStorage(habits: Habit[]): CompletionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (!raw) {
      const initial = getInitialSampleCompletions(habits);
      saveCompletionsToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load completions from localStorage', err);
    return getInitialSampleCompletions(habits);
  }
}

export function saveCompletionsToStorage(records: CompletionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save completions to localStorage', err);
  }
}

export function loadSettingsFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettingsToStorage(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load settings from localStorage', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function exportDataAsJSON(habits: Habit[], completions: CompletionRecord[], settings: UserSettings): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    habits,
    completions,
    settings,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCompletionsAsCSV(habits: Habit[], completions: CompletionRecord[]): void {
  const habitMap = new Map<string, string>();
  habits.forEach((h) => habitMap.set(h.id, h.name));

  const headers = ['Date', 'Habit ID', 'Habit Name', 'Completed', 'Progress Value', 'Completed At'];
  const rows = completions.map((c) => {
    const name = (habitMap.get(c.habitId) || 'Unknown').replace(/"/g, '""');
    return [
      c.date,
      c.habitId,
      `"${name}"`,
      c.completed ? 'YES' : 'NO',
      c.currentValue ?? '',
      c.completedAt ?? '',
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitflow-history-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    habits: Habit[];
    completions: CompletionRecord[];
    settings?: UserSettings;
  };
}

export function parseAndValidateImportJSON(jsonText: string): ImportResult {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON file structure.' };
    }

    if (!Array.isArray(parsed.habits)) {
      return { success: false, message: 'Missing or invalid "habits" array in imported file.' };
    }

    if (!Array.isArray(parsed.completions)) {
      return { success: false, message: 'Missing or invalid "completions" array in imported file.' };
    }

    // Validate habit elements
    const validHabits: Habit[] = parsed.habits.filter(
      (h: unknown): h is Habit =>
        typeof h === 'object' &&
        h !== null &&
        typeof (h as Habit).id === 'string' &&
        typeof (h as Habit).name === 'string'
    );

    // Validate completion records
    const validCompletions: CompletionRecord[] = parsed.completions.filter(
      (c: unknown): c is CompletionRecord =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as CompletionRecord).habitId === 'string' &&
        typeof (c as CompletionRecord).date === 'string'
    );

    return {
      success: true,
      message: `Successfully validated ${validHabits.length} habits and ${validCompletions.length} history records.`,
      data: {
        habits: validHabits,
        completions: validCompletions,
        settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : undefined,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? `Parse error: ${err.message}` : 'Failed to parse JSON file.',
    };
  }
}

export function clearAllStorageData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (err) {
    console.error('Failed to clear localStorage', err);
  }
}
