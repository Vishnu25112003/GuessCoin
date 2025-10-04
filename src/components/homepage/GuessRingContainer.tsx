import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // MODIFIED: Changed to a named import
import type { GuessData } from "../../types/types";
import CircularGuessRingUI from "./SimpleGuessRing";

interface HashDetails {
  actualHash: string;
  secretKey: string;
  dummyHash: string;
  targetBlockNumber: number;
  tokenSizes: number;
  paidGuess: boolean;
  complex: boolean;
}

interface StoredGuessData {
  Sno: number;
  blockIncrementCount: number;
  blockHashGuess: string;
  tokenSize: number;
  paymentPaidBet: string;
  overWrite: boolean;
  complex: boolean;
  dummyHash: string;
  actualHash: string;
  secretKey: string;
  guessId: number;
  tokens: string;
  timestamp: number;
  txHash?: string;
  gasUsed?: string;
  formattedPayment: string;
}

interface GuessRingContainerProps {
  guesses: GuessData[];
  selectedGuess: GuessData | null;
  onSelectGuess: (guess: GuessData) => void;
  onNewGuess?: (guessId: number) => void;
  onVerify?: (guessId: number) => void;
  onCheckValidity?: (guessId: number) => void;
}

const GuessRingContainer: React.FC<GuessRingContainerProps> = ({
  guesses,
  selectedGuess,
  onSelectGuess,
  onNewGuess,
  onVerify,
  onCheckValidity,
}) => {
  const auth = useAuth(); // MODIFIED: Adjusted hook usage accordingly
  const navigate = useNavigate();

  const [activeGuessId, setActiveGuessId] = useState<number | null>(null);
  const [clockwiseAngle, setClockwiseAngle] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hashDetails, setHashDetails] = useState<HashDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRotationPaused, setIsRotationPaused] = useState(false);
  const [isSelectedGuessPlaced, setIsSelectedGuessPlaced] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isRotationPaused) return;
    const interval = setInterval(() => {
      setClockwiseAngle((prev) => (prev + 0.6) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isRotationPaused]);

  const checkGuessDataInStorage = (guessId: number): boolean => {
    try {
      const lastSubmission = localStorage.getItem('lastGuessSubmission');
      if (lastSubmission) {
        const data: StoredGuessData = JSON.parse(lastSubmission);
        if (data.guessId === guessId) return true;
      }
      const currentAccount = localStorage.getItem("currentAccount");
      if (currentAccount) {
        const firebaseKey = `guesses/${currentAccount}/${guessId}`;
        const guessData = localStorage.getItem(firebaseKey);
        if (guessData) return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (selectedGuess) {
      const hasData = checkGuessDataInStorage(selectedGuess.id);
      setIsSelectedGuessPlaced(hasData);
    } else {
      setIsSelectedGuessPlaced(false);
    }
  }, [selectedGuess]);

  const fetchGuessDataFromStorage = (guessId: number): HashDetails => {
    try {
        const lastSubmission = localStorage.getItem('lastGuessSubmission');
        if (lastSubmission) {
            const data: StoredGuessData = JSON.parse(lastSubmission);
            if (data.guessId === guessId) {
                return {
                    actualHash: data.actualHash || '-',
                    secretKey: data.secretKey || '-',
                    dummyHash: data.dummyHash || '-',
                    targetBlockNumber: data.blockIncrementCount || 0,
                    tokenSizes: data.tokenSize || 0,
                    paidGuess: data.paymentPaidBet !== '0',
                    complex: data.complex || false,
                };
            }
        }

        const currentAccount = localStorage.getItem("currentAccount");
        if (currentAccount) {
            const firebaseKey = `guesses/${currentAccount}/${guessId}`;
            const guessData = localStorage.getItem(firebaseKey);
            if (guessData) {
                const data: StoredGuessData = JSON.parse(guessData);
                return {
                    actualHash: data.actualHash || '-',
                    secretKey: data.secretKey || '-',
                    dummyHash: data.dummyHash || '-',
                    targetBlockNumber: data.blockIncrementCount || 0,
                    tokenSizes: data.tokenSize || 0,
                    paidGuess: data.paymentPaidBet !== '0',
                    complex: data.complex || false,
                };
            }
        }
        return { actualHash: '-', secretKey: '-', dummyHash: '-', targetBlockNumber: 0, tokenSizes: 0, paidGuess: false, complex: false };
    } catch (error) {
        console.error("Error fetching guess data from storage:", error);
        return { actualHash: '-', secretKey: '-', dummyHash: '-', targetBlockNumber: 0, tokenSizes: 0, paidGuess: false, complex: false };
    }
  };

  const getOrbitRadius = () => isMobile ? Math.min(window.innerWidth, window.innerHeight) * 0.22 : 200;
  const getNumberSize = () => isMobile ? 50 : 60;
  const orbitRadius = getOrbitRadius();
  const numberSize = getNumberSize();

  const handleNewGuessClick = (guessId: number) => {
    navigate(`/guess/${guessId}`);
    if (onNewGuess) {
      onNewGuess(guessId);
    }
  };

  const handleNumberClick = (guess: GuessData) => {
    if (!isExpanded) {
      onSelectGuess(guess);
      setActiveGuessId((curr) => (curr === guess.id ? null : guess.id));
      setIsRotationPaused(true);
    }
  };

  const handleActionClick = (
    action?: (id: number) => void,
    guessId?: number
  ) => {
    if (action && guessId) {
        action(guessId);
    }
    setActiveGuessId(null);
    setIsRotationPaused(false);
  };

  const handleCenterClick = async () => {
    if (!isExpanded) {
      setLoading(true);
      setTimeout(() => {
        const guessId = selectedGuess?.id || 1;
        const fetchedData = fetchGuessDataFromStorage(guessId);
        setHashDetails(fetchedData);
        setLoading(false);
        setIsExpanded(true);
        setActiveGuessId(null);
        setIsRotationPaused(false);
      }, 500);
    } else {
      setIsExpanded(false);
      setHashDetails(null);
    }
  };

  const handleCloseActions = () => {
    setActiveGuessId(null);
    setIsRotationPaused(false);
  };

  const handleBackFromDetails = () => {
    setIsExpanded(false);
    setHashDetails(null);
    setIsRotationPaused(false);
  };

  const getBigCirclePosition = () => {
    const centerY = window.innerHeight / 2;
    if (isExpanded) {
      return isMobile
        ? { x: window.innerWidth / 2, y: centerY }
        : { x: window.innerWidth * 0.15, y: centerY };
    }
    return { x: window.innerWidth / 2, y: centerY };
  };
  const bigCirclePosition = getBigCirclePosition();

  const actionButtons = [
    { label: 'New Guess', color: '#3b82f6', bgColor: 'from-blue-500 to-blue-600', icon: '➕', action: handleNewGuessClick, description: 'Create new guess' },
    { label: 'Verify', color: '#10b981', bgColor: 'from-green-500 to-green-600', icon: '✔️', action: onVerify, description: 'Verify guess' },
    { label: 'Check Validity', color: '#f59e0b', bgColor: 'from-yellow-500 to-yellow-600', icon: '🔍', action: onCheckValidity, description: 'Check validity' },
  ];

  return (
    <CircularGuessRingUI
      guesses={guesses}
      selectedGuess={selectedGuess}
      activeGuessId={activeGuessId}
      clockwiseAngle={clockwiseAngle}
      isExpanded={isExpanded}
      hashDetails={hashDetails}
      loading={loading}
      isMobile={isMobile}
      orbitRadius={orbitRadius}
      numberSize={numberSize}
      bigCirclePosition={bigCirclePosition}
      actionButtons={actionButtons}
      isSelectedGuessPlaced={isSelectedGuessPlaced}
      onNumberClick={handleNumberClick}
      onActionClick={handleActionClick}
      onCenterClick={handleCenterClick}
      onCloseActions={handleCloseActions}
      onBackFromDetails={handleBackFromDetails}
    />
  );
};

export default GuessRingContainer;
