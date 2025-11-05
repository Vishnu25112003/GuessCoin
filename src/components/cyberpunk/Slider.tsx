import React from "react";

interface CyberSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export const CyberSlider: React.FC<CyberSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-display font-bold text-cyber-primary uppercase tracking-wider">
          {label}
        </label>
        <div className="text-cyber-text font-mono text-sm">
          {value}
          {suffix}
        </div>
      </div>
      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none bg-transparent cursor-pointer"
        />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyber-primary/40 via-cyber-secondary/40 to-cyber-accent/40 rounded" />
      </div>
      <div className="flex justify-between text-xs text-gray-400 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <style>
        {`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 9999px;
            background: #00F3FF;
            box-shadow: 0 0 12px rgba(0,243,255,0.7);
            position: relative;
            z-index: 10;
          }
          input[type=range]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 9999px;
            background: #00F3FF;
            box-shadow: 0 0 12px rgba(0,243,255,0.7);
          }
          input[type=range] {
            outline: none;
            height: 20px;
          }
        `}
      </style>
    </div>
  );
};