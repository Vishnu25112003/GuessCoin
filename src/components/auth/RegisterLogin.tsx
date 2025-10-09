import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RegisterLogin: React.FC = () => {
  const {
    isLoading,
    statusMessage,
    handleLogin,
    handleRegister,
    connectedAccount,
  } = useAuth();
  const navigate = useNavigate();

  // New styles for the game-based UI
  const gameStyles = {
    background: "bg-gray-950",
    container:
      "bg-gray-800 border-4 border-gray-700 rounded-3xl shadow-[0_0_25px_rgba(0,0,0,0.5)]",
    title: "text-blue-400 text-3xl font-bold font-mono tracking-wide",
    subtitle: "text-gray-400 text-sm font-mono",
    button:
      "w-full py-4 px-6 rounded-lg text-white font-bold transition-all duration-300 transform hover:scale-[1.03] disabled:bg-gray-700 disabled:cursor-not-allowed",
    buttonLogin: "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20",
    buttonRegister:
      "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20",
    statusMessage:
      "text-yellow-400 bg-gray-900 border-2 border-yellow-600 rounded-lg",
  };

  if (!connectedAccount) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${gameStyles.background} p-4`}
      >
        <div
          className={`text-center p-8 rounded-xl w-full max-w-sm ${gameStyles.container}`}
        >
          <div className="text-8xl text-red-500 mb-4 font-extrabold animate-pulse">
            !
          </div>
          <h2
            className={`text-2xl font-bold mb-4 ${gameStyles.title.replace("text-blue-400", "text-red-500")}`}
          >
            ERROR
          </h2>
          <p className={`${gameStyles.subtitle} mb-6`}>
            Wallet Not Connected. Please return to the previous screen.
          </p>
          <button
            onClick={() => navigate("/")}
            className={`${gameStyles.button} bg-indigo-600 hover:bg-indigo-700`}
          >
            ← Back to Wallet Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${gameStyles.background} p-4`}
    >
      <div
        className={`text-center p-8 md:p-12 w-full max-w-md ${gameStyles.container}`}
      >
        {/* Game-based header and icons */}
        <div className="text-7xl text-indigo-400 mb-6 font-extrabold animate-pulse">
          ⟠
        </div>
        <h1
          className="text-xl text-green-400 mb-2 font-mono break-all p-3 rounded-lg border-2 border-green-600/50 bg-gray-900/50"
          title={connectedAccount}
        >
          <span className="text-green-300">
            {connectedAccount.substring(0, 6)}
          </span>
          ...
          <span className="text-green-300">
            {connectedAccount.substring(connectedAccount.length - 4)}
          </span>
        </h1>
        <p className={`${gameStyles.subtitle} mb-8`}>
          ACCESS GRANTED: Ready to join the DECENT GUESS network
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mb-6">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`${gameStyles.button} ${gameStyles.buttonLogin}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying Credentials...
              </div>
            ) : (
              "LOGIN"
            )}
          </button>

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className={`${gameStyles.button} ${gameStyles.buttonRegister}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Initializing...
              </div>
            ) : (
              "REGISTER"
            )}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`text-sm font-mono p-4 rounded-lg border ${gameStyles.statusMessage} mb-4`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-yellow-400">►</span>
              {statusMessage}
            </div>
          </div>
        )}

        {/* Back to Wallet Selection */}
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 hover:text-gray-300 font-mono transition-colors mt-4"
        >
          ← EXIT PROTOCOL
        </button>
      </div>
    </div>
  );
};

export default RegisterLogin;
