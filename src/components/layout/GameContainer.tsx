import React from "react";
import { Scanlines } from "../cyberpunk/effects/Scanlines";
import { HexGrid } from "../cyberpunk/effects/HexGrid";

interface GameContainerProps {
  children: React.ReactNode;
  showEffects?: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  children,
  showEffects = true,
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {showEffects && (
        <>
          <HexGrid />
          <Scanlines />
        </>
      )}

      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="container mx-auto">{children}</div>
      </div>
    </div>
  );
};
