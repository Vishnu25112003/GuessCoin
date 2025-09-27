import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
    const { disconnectWallet } = useAuth();
    const account = localStorage.getItem('currentAccount');

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to GuessCoin!</h1>
            <p className="mb-8 text-center">You are logged in as: <br/><span className="font-mono bg-gray-700 p-1 rounded break-all">{account}</span></p>
            <button
                onClick={disconnectWallet}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-md font-semibold"
            >
                Log Out & Disconnect Wallet
            </button>
        </div>
    );
};

export default DashboardPage;
