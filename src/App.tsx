// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import WalletPage from "./pages/WalletPage";
import RegisterLogin from "./components/auth/RegisterLogin";
import DashboardPage from "./pages/DashboardPage";
import GuessPage from "./components/newguess/GuessPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// MODIFIED: Imported the new GuessInfo component
import GuessInfo from "./components/verify/VerifyOffChain";
import VerifyOnChain from "./components/verify/VerifyOnChain";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root route - redirect to wallet page */}
        <Route path="/" element={<Navigate to="/wallet" replace />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/auth" element={<RegisterLogin />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/guess/:id" element={<GuessPage />} />

        {/* MODIFIED: Added the new route for the verification page */}
        <Route path="/verify/:guessId" element={<GuessInfo />} />
        <Route path="/verify-onchain/:guessId" element={<VerifyOnChain />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/wallet" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  );
}

export default App;
