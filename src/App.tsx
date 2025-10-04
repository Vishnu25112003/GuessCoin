import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import WalletPage from './pages/WalletPage';
import RegisterLogin from './components/auth/RegisterLogin';
import DashboardPage from './pages/DashboardPage';
import GuessPage from './components/newguess/GuessPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<WalletPage />} />
        <Route path="/auth" element={<RegisterLogin />} />
        <Route path="/register" element={<RegisterLogin />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/guess/:id" element={<GuessPage />} />
      </Routes>
      
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
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
