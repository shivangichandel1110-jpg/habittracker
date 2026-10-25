import { Habit } from '../types';

/**
 * Returns a YYYY-MM-DD string representing the local date.
 * Avoids UTC timezone conversion issues.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0); // Noon to avoid daylight saving edge cases
}

/**
 * Adds or subtracts days from a local date string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

/**
 * Checks whether a habit is scheduled to be performed on a specific date.
 */
export function isHabitScheduledForDate(habit: Habit, dateStr: string): boolean {
  if (habit.archived) return false;
  // If date is before habit creation, it wasn't active yet
  if (dateStr < habit.createdAt) return false;

  const date = parseLocalDate(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  switch (habit.frequency.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'specific_days':
      return Array.isArray(habit.frequency.days) && habit.frequency.days.includes(dayOfWeek);
    case 'times_per_week':
      // For flexible weekly targets, it is active on every day until target is reached
      return true;
    default:
      return true;
  }
}

/**
 * Formats a date string into readable user friendly format.
 * e.g., "Sunday, October 25"
 */
export function formatDisplayDate(dateStr: string): string {
  const today = formatLocalDate();
  if (dateStr === today) return 'Today';
  const yesterday = addDaysToDateString(today, -1);
  if (dateStr === yesterday) return 'Yesterday';
  const tomorrow = addDaysToDateString(today, 1);
  if (dateStr === tomorrow) return 'Tomorrow';

  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats full greeting date like "Sunday, October 25, 2026"
 */
export function formatFullGreetingDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get days for the current week strip centered or starting according to weekStartsOn
 */
export function getWeekDays(
  anchorDate: Date = new Date(),
  weekStartsOn: 0 | 1 = 1
): { dateStr: string; dayName: string; dayNumber: number; isToday: boolean; isSelected: boolean }[] {
  const current = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
  const currentDayOfWeek = current.getDay();
  
  // Calculate difference to first day of week
  let diff = currentDayOfWeek - weekStartsOn;
  if (diff < 0) diff += 7;

  const firstDay = new Date(current);
  firstDay.setDate(current.getDate() - diff);

  const todayStr = formatLocalDate(new Date());
  const anchorStr = formatLocalDate(anchorDate);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() + i);
    const dateStr = formatLocalDate(d);

    days.push({
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
      isSelected: dateStr === anchorStr,
    });
  }
  return days;
}

/**
 * Get days of a specific month for the calendar grid
 */
export function getCalendarGrid(year: number, month: number, weekStartsOn: 0 | 1 = 1) {
  // First day of month
  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstOfMonth.getDay();

  // Number of padding days before the 1st
  let leadingPadding = firstDayOfWeek - weekStartsOn;
  if (leadingPadding < 0) leadingPadding += 7;

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const grid: {
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  const todayStr = formatLocalDate(new Date());

  // Previous month padding
  for (let i = leadingPadding - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const date = new Date(prevYear, prevMonth, d);
    const dateStr = formatLocalDate(date);
    grid.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = formatLocalDate(date);
    grid.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Trailing padding to fill 35 or 42 grid cells
  const remainingCells = (7 - (grid.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const date = new Date(nextYear, nextMonth, d);
    const dateStr = formatLocalDate(date);
    grid.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return grid;
}
