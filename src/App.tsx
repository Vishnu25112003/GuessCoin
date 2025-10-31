import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SessionPage from './pages/SessionPage';
import WalletPage from './pages/WalletPage';
import SeedDataPage from './pages/SeedDataPage';
import MatchesPage from './pages/MatchesPage';
import NewGuessPage from './pages/NewGuessPage';
import OnChainPage from './pages/OnChainPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WalletPage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/seed" element={<SeedDataPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/new" element={<NewGuessPage />} />
        <Route path="/onchain" element={<OnChainPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
