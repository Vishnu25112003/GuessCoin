import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterLogin: React.FC = () => {
    const { isLoading, statusMessage, handleLogin, handleRegister, connectedAccount } = useAuth();
    const navigate = useNavigate();

    // A guard to ensure a wallet is connected before showing this page.
    if (!connectedAccount) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
                <p className="text-red-500 text-center font-semibold">No wallet connected. Please go back and connect a wallet to continue.</p>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md font-bold">
                    Go Back to Wallet Selection
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full text-center">
                <div className="mb-8">
                    <h2 className="text-5xl font-bold text-gray-800">GUESS COIN</h2>
                    <p className="text-sm text-gray-500 mt-2 truncate">Connected: <span className="font-mono">{connectedAccount}</span></p>
                </div>
                <div className="space-y-6">
                    <button 
                        onClick={handleRegister} 
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-lg transition-all disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? 'Processing...' : 'REGISTER'}
                    </button>
                    <div className="text-gray-500 font-semibold">OR</div>
                    <button 
                        onClick={handleLogin} 
                        disabled={isLoading}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold text-lg transition-all disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? 'Processing...' : 'LOGIN'}
                    </button>
                </div>
                {statusMessage && (
                    <div className="mt-6 p-3 bg-gray-200 text-gray-700 rounded-md min-h-[40px]">
                        <p>{statusMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterLogin;
