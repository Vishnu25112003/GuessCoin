import React from "react";

export const Scanlines: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-primary to-transparent opacity-5 animate-scanline" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)]" />
    </div>
  );
};
