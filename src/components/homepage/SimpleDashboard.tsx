import React, { useState } from "react";
// MODIFIED: Imported useNavigate
import { useNavigate } from "react-router-dom";
import GuessRingContainer from "./GuessRingContainer";
import type { GuessData } from "../../types/types";

interface MainDashboardProps {
  guesses: GuessData[];
}

const MainDashboard: React.FC<MainDashboardProps> = ({ guesses }) => {
  const [selectedGuess, setSelectedGuess] = useState<GuessData | null>(
    guesses[0] || null
  );
  const [, setCurrentAction] = useState("");
  // MODIFIED: Initialized the navigate function
  const navigate = useNavigate();

  return (
    <div className="pt-16 font-mono">
      {/* Background elements */}
      <div className="gc-geometric-bg" aria-hidden="true"></div>
      <div className="gc-dots-pattern" aria-hidden="true"></div>
      <div className="gc-floating-elements" aria-hidden="true">
        <div className="gc-float-circle"></div>
        <div className="gc-float-square"></div>
        <div className="gc-float-triangle"></div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          zIndex: 2,
        }}
      >
        <GuessRingContainer
          guesses={guesses}
          selectedGuess={selectedGuess}
          onSelectGuess={(g) => setSelectedGuess(g)}
          onNewGuess={(guessId) => navigate(`/guess/${guessId}`)}
          // MODIFIED: The onVerify prop now navigates to the verify page
          onVerify={(guessId) => navigate(`/verify/${guessId}`)}
          onCheckValidity={(guessId) =>
            setCurrentAction(`Check Validity ${guessId}`)
          }
        />
      </div>

      {/* STYLES */}
      <style>
        {`
          .gc-geometric-bg {
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background: radial-gradient(50% 40% at 50% 45%, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.00) 70%),
                        radial-gradient(25% 20% at 8% 8%, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.00) 70%),
                        radial-gradient(25% 20% at 92% 92%, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.00) 70%),
                        repeating-linear-gradient( 45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 28px ),
                        repeating-linear-gradient( -45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 35px );
          }
          .gc-dots-pattern {
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background: radial-gradient(circle at 25% 25%, rgba(148,163,184,0.08) 1px, transparent 1px),
                        radial-gradient(circle at 75% 75%, rgba(148,163,184,0.06) 1px, transparent 1px);
            background-size: 40px 40px, 60px 60px;
            background-position: 0 0, 20px 20px;
            mask: radial-gradient(70% 60% at 50% 50%, #000 50%, rgba(0,0,0,0.3) 80%, transparent 100%);
          }
          .gc-floating-elements {
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
          }
          .gc-float-circle {
            position: absolute;
            top: 20%; left: 15%;
            width: 120px; height: 120px;
            border: 1px solid rgba(59,130,246,0.12);
            border-radius: 50%;
            background: rgba(59,130,246,0.03);
            animation: floatUp 20s ease-in-out infinite;
          }
          .gc-float-square {
            position: absolute;
            top: 60%; right: 20%;
            width: 80px; height: 80px;
            border: 1px solid rgba(139,92,246,0.10);
            background: rgba(139,92,246,0.025);
            transform: rotate(12deg);
            animation: floatSide 25s ease-in-out infinite;
          }
          .gc-float-triangle {
            position: absolute;
            bottom: 25%; left: 70%;
            width: 0; height: 0;
            border-left: 30px solid transparent;
            border-right: 30px solid transparent;
            border-bottom: 52px solid rgba(34,197,94,0.08);
            animation: floatRotate 30s linear infinite;
          }
          @keyframes floatUp { 0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; } 50% { transform: translateY(-15px) scale(1.02); opacity: 0.8; } }
          @keyframes floatSide { 0%, 100% { transform: rotate(12deg) translateX(0px); opacity: 0.5; } 50% { transform: rotate(15deg) translateX(10px); opacity: 0.7; } }
          @keyframes floatRotate { 0% { transform: rotate(0deg); opacity: 0.4; } 100% { transform: rotate(360deg); opacity: 0.4; } }
          @media (prefers-reduced-motion: reduce) { .gc-float-circle, .gc-float-square, .gc-float-triangle { animation: none !important; } }
          @media (max-width: 768px) { .gc-floating-elements { display: none; } }
        `}
      </style>
    </div>
  );
};

export default MainDashboard;
