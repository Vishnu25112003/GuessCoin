// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";

// import HomePage from "./pages/HomePage";
// import SessionPage from "./pages/SessionPage";
// import WalletPage from "./pages/WalletPage";
// import SeedDataPage from "./pages/SeedDataPage";
// import MatchesPage from "./pages/MatchesPage";
// import NewGuessPage from "./pages/NewGuessPage";
// import OnChainPage from "./pages/OnChainPage";

// import "./styles/cyberpunk.css";

// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Navigate to="/wallet" replace />} />
//           <Route path="/wallet" element={<WalletPage />} />
//           <Route path="/session" element={<SessionPage />} />
//           <Route path="/home" element={<HomePage />} />
//           <Route path="/new-guess" element={<NewGuessPage />} />
//           <Route path="/seed-data" element={<SeedDataPage />} />
//           <Route path="/matches" element={<MatchesPage />} />
//           <Route path="/on-chain" element={<OnChainPage />} />
//         </Routes>
//       </BrowserRouter>

//       <Toaster position="top-right" />
//     </>
//   );
// }

// export default App;



import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import SessionPage from "./pages/SessionPage";
import WalletPage from "./pages/WalletPage";
import SeedDataPage from "./pages/SeedDataPage";
import MatchesPage from "./pages/MatchesPage";
import NewGuessPage from "./pages/NewGuessPage";
import OnChainPage from "./pages/OnChainPage";
import HammerAnimationPage from "./pages/HammerAnimationPage";
import "./styles/cyberpunk.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/wallet" replace />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/new-guess" element={<NewGuessPage />} />
        <Route path="/seed-data" element={<SeedDataPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/hammer-animation" element={<HammerAnimationPage />} />
        <Route path="/on-chain" element={<OnChainPage />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
