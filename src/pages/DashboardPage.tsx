import React from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/homepage/Navbar";
import SimpleDashboard from "../components/homepage/SimpleDashboard";
import type { GuessData } from "../types/types";

const DashboardPage: React.FC = () => {
  const { disconnectWallet } = useAuth();

  // Sample data for guesses
  const sampleGuesses: GuessData[] = [
    {
      starIndex: undefined,
      id: 1,
      status: "verified",
      actualHash: "0x1234567890abcdef1234567890abcdef12345678",
      secretKey: "secret1",
      dummyHash: "0xabcdef1234567890abcdef1234567890abcdef12",
      targetBlockNumber: 12345,
      tokenSizes: 100,
      paidGuess: true,
      complex: false,
      angle: 0,
      number: undefined
    },
    {
      starIndex: undefined,
      id: 2,
      status: "unverified",
      actualHash: "0x9876543210fedcba9876543210fedcba98765432",
      secretKey: "secret2",
      dummyHash: "0xfedcba9876543210fedcba9876543210fedcba98",
      targetBlockNumber: 12346,
      tokenSizes: 150,
      paidGuess: false,
      complex: true,
      angle: 0,
      number: undefined
    },
    {
      starIndex: undefined,
      id: 3,
      status: "unverified",
      actualHash: "0x5555666677778888999900001111222233334444",
      secretKey: "secret3",
      dummyHash: "0x4444333322221111000099998888777766665555",
      targetBlockNumber: 12347,
      tokenSizes: 75,
      paidGuess: true,
      complex: false,
      angle: 0,
      number: undefined
    },
    {
      starIndex: undefined,
      id: 4,
      status: "verified",
      actualHash: "0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff",
      secretKey: "secret4",
      dummyHash: "0xffffffffeeeeeeeddddddccccccbbbbbbaaaaaaaa",
      targetBlockNumber: 12348,
      tokenSizes: 200,
      paidGuess: false,
      complex: true,
      angle: 0,
      number: undefined
    },
    {
      starIndex: undefined,
      id: 5,
      status: "unverified",
      actualHash: "0x1111222233334444555566667777888899990000",
      secretKey: "secret5",
      dummyHash: "0x0000999988887777666655554444333322221111",
      targetBlockNumber: 12349,
      tokenSizes: 125,
      paidGuess: true,
      complex: false,
      angle: 0,
      number: undefined
    },
  ];

  const handleLogout = () => {
    disconnectWallet();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e113a 50%, #0f172a 100%)",
      }}
    >
      <Navbar onLogout={handleLogout} />
      <SimpleDashboard guesses={sampleGuesses} />
    </div>
  );
};

export default DashboardPage;
