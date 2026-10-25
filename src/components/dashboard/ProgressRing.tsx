import React from 'react';

interface ProgressRingProps {
  percentage: number;
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  completed,
  total,
  size = 120,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const validPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-emerald-500 dark:stroke-emerald-400 transition-all duration-700 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Centered label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {validPercentage}%
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
};
