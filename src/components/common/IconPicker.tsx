import React from 'react';
import { AVAILABLE_ICONS } from '../../utils/iconUtils';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  colorSchemeAccent?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon, colorSchemeAccent }) => {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      {AVAILABLE_ICONS.map((item) => {
        const Icon = item.icon;
        const isSelected = selectedIcon === item.name;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelectIcon(item.name)}
            title={item.label}
            className={`p-2.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? 'bg-white dark:bg-slate-800 shadow-xs ring-2 ring-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Icon className="w-5 h-5" style={{ color: isSelected && colorSchemeAccent ? colorSchemeAccent : undefined }} />
          </button>
        );
      })}
    </div>
  );
};
