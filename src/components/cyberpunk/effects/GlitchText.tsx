import React, { useState, useEffect } from "react";

interface GlitchTextProps {
  children: string;
  className?: string;
  animated?: boolean;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className = "",
  animated = true,
}) => {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`relative z-10 cyber-text-glow ${glitching ? "animate-glitch" : ""}`}
      >
        {children}
      </span>
      {glitching && (
        <>
          <span
            className="absolute top-0 left-0 text-cyber-secondary opacity-70 animate-glitch"
            style={{ clipPath: "inset(0 0 80% 0)" }}
          >
            {children}
          </span>
          <span
            className="absolute top-0 left-0 text-cyber-primary opacity-70 animate-glitch"
            style={{ clipPath: "inset(80% 0 0 0)" }}
          >
            {children}
          </span>
        </>
      )}
    </div>
  );
};
