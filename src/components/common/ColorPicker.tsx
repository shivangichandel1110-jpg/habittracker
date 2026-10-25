import React from 'react';
import { COLOR_SCHEMES } from '../../utils/iconUtils';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {Object.values(COLOR_SCHEMES).map((scheme) => {
        const isSelected = selectedColor === scheme.id;
        return (
          <button
            key={scheme.id}
            type="button"
            onClick={() => onSelectColor(scheme.id)}
            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center relative cursor-pointer ${
              isSelected ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-slate-200 dark:ring-offset-slate-900 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: scheme.accent }}
            title={scheme.name}
            aria-label={`Select ${scheme.name} color`}
          >
            {isSelected && (
              <span className="w-2.5 h-2.5 bg-white rounded-full shadow-xs" />
            )}
          </button>
        );
      })}
    </div>
  );
};
