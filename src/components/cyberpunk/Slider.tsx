import React, { useMemo } from "react";

interface CyberSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  // When enabled, the slider track and thumb color change based on value
  colorMode?: "default" | "byValue";
}

export const CyberSlider: React.FC<CyberSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
  colorMode = "default",
}) => {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const colors = useMemo(() => {
    if (colorMode !== "byValue") {
      return {
        trackBg:
          "linear-gradient(to right, var(--cyber-primary,#00F3FF), var(--cyber-secondary,#a855f7), var(--cyber-accent,#ec4899))",
        thumb: "#00F3FF",
        thumbShadow: "rgba(0,243,255,0.7)",
      };
    }
    // Map low->green, mid->amber, high->rose
    if (pct <= 30) {
      return {
        trackBg: "linear-gradient(to right, #22c55e, #4ade80)",
        thumb: "#22c55e",
        thumbShadow: "rgba(34,197,94,0.7)",
      };
    }
    if (pct <= 90) { // 30% green + 60% yellow = 90%
      return {
        trackBg: "linear-gradient(to right, #f59e0b, #fbbf24)",
        thumb: "#f59e0b",
        thumbShadow: "rgba(245,158,11,0.7)",
      };
    }
    return {
      trackBg: "linear-gradient(to right, #f43f5e, #ec4899)",
      thumb: "#f43f5e",
      thumbShadow: "rgba(244,63,94,0.7)",
    };
  }, [pct, colorMode]);

  return (
    <div
      className="space-y-2"
      style={{
        // CSS variables used by the thumb styles below
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - custom CSS vars

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - custom CSS vars
        "--thumb-color": colors.thumb,

        "--thumb-shadow": colors.thumbShadow,
      }}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-display font-bold text-cyber-primary uppercase tracking-wider">
          {label}
        </label>
        <div className="font-mono text-sm" style={{ color: colors.thumb }}>
          {value}
          {suffix}
        </div>
      </div>
      <div className="relative py-2">
        {/* Base track */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyber-primary/30 via-cyber-secondary/30 to-cyber-accent/30 rounded" />
        {/* Filled track */}
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-1 rounded"
          style={{ width: `${pct}%`, backgroundImage: colors.trackBg }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full appearance-none bg-transparent cursor-pointer"
        />
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
            background: var(--thumb-color, #00F3FF);
            box-shadow: 0 0 12px var(--thumb-shadow, rgba(0,243,255,0.7));
            position: relative;
            z-index: 10;
          }
          input[type=range]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 9999px;
            background: var(--thumb-color, #00F3FF);
            box-shadow: 0 0 12px var(--thumb-shadow, rgba(0,243,255,0.7));
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
