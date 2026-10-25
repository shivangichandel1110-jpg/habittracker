import React from 'react';
import {
  Droplets,
  BookOpen,
  Dumbbell,
  Brain,
  Moon,
  Sparkles,
  Heart,
  Coffee,
  Sunrise,
  Footprints,
  Target,
  Flame,
  Apple,
  Music,
  Laptop,
  CheckCircle2,
  LucideProps,
} from 'lucide-react';

export const AVAILABLE_ICONS: { name: string; label: string; icon: React.ComponentType<LucideProps> }[] = [
  { name: 'droplets', label: 'Hydration', icon: Droplets },
  { name: 'book-open', label: 'Study & Reading', icon: BookOpen },
  { name: 'dumbbell', label: 'Exercise', icon: Dumbbell },
  { name: 'brain', label: 'Mindfulness', icon: Brain },
  { name: 'moon', label: 'Sleep & Rest', icon: Moon },
  { name: 'sparkles', label: 'Self Care', icon: Sparkles },
  { name: 'heart', label: 'Health', icon: Heart },
  { name: 'coffee', label: 'Morning Ritual', icon: Coffee },
  { name: 'sunrise', label: 'Early Routine', icon: Sunrise },
  { name: 'footprints', label: 'Walking & Steps', icon: Footprints },
  { name: 'target', label: 'Focus & Goals', icon: Target },
  { name: 'flame', label: 'Energy & Habit', icon: Flame },
  { name: 'apple', label: 'Nutrition', icon: Apple },
  { name: 'music', label: 'Creative', icon: Music },
  { name: 'laptop', label: 'Work & Code', icon: Laptop },
];

export function renderHabitIcon(iconName: string, props: LucideProps = { className: 'w-5 h-5' }) {
  const match = AVAILABLE_ICONS.find((item) => item.name === iconName);
  const IconComponent = match ? match.icon : CheckCircle2;
  return <IconComponent {...props} />;
}

export interface ColorScheme {
  id: string;
  name: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
  accent: string;
  hoverBg: string;
}

export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  emerald: {
    id: 'emerald',
    name: 'Mint / Emerald',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-400',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800/60',
    accent: '#10b981',
    hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  },
  teal: {
    id: 'teal',
    name: 'Teal Ocean',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/40',
    textLight: 'text-teal-700',
    textDark: 'dark:text-teal-400',
    borderLight: 'border-teal-200',
    borderDark: 'dark:border-teal-800/60',
    accent: '#14b8a6',
    hoverBg: 'hover:bg-teal-100 dark:hover:bg-teal-900/40',
  },
  sky: {
    id: 'sky',
    name: 'Sky Blue',
    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/40',
    textLight: 'text-sky-700',
    textDark: 'dark:text-sky-400',
    borderLight: 'border-sky-200',
    borderDark: 'dark:border-sky-800/60',
    accent: '#0284c7',
    hoverBg: 'hover:bg-sky-100 dark:hover:bg-sky-900/40',
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo Focus',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/40',
    textLight: 'text-indigo-700',
    textDark: 'dark:text-indigo-400',
    borderLight: 'border-indigo-200',
    borderDark: 'dark:border-indigo-800/60',
    accent: '#6366f1',
    hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
  },
  violet: {
    id: 'violet',
    name: 'Serene Violet',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    textLight: 'text-violet-700',
    textDark: 'dark:text-violet-400',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800/60',
    accent: '#8b5cf6',
    hoverBg: 'hover:bg-violet-100 dark:hover:bg-violet-900/40',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-400',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800/60',
    accent: '#f59e0b',
    hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/40',
  },
  rose: {
    id: 'rose',
    name: 'Gentle Rose',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    textLight: 'text-rose-700',
    textDark: 'dark:text-rose-400',
    borderLight: 'border-rose-200',
    borderDark: 'dark:border-rose-800/60',
    accent: '#f43f5e',
    hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900/40',
  },
};

export function getColorScheme(colorId: string): ColorScheme {
  return COLOR_SCHEMES[colorId] || COLOR_SCHEMES.emerald;
}
