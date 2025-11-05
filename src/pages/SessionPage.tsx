import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, LogIn, UserPlus, Shield } from "lucide-react";
import { login, register } from "../services/walletFlow";
import { CyberButton } from "../components/cyberpunk/Button";
import { CyberCard } from "../components/cyberpunk/Card";
import { CyberBadge } from "../components/cyberpunk/Badge";
import { GlitchText } from "../components/cyberpunk/effects/GlitchText";
import { Scanlines } from "../components/cyberpunk/effects/Scanlines";
import { HexGrid } from "../components/cyberpunk/effects/HexGrid";
import { CyberModal } from "../components/cyberpunk/Modal";
import { useCyberModal } from "../hooks/useCyberModal";

export default function SessionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress] = useState<string | null>(
    localStorage.getItem("currentAccount"),
  );
  const modal = useCyberModal();

  async function onLogin() {
    setIsLoading(true);
    try {
      const res = await login();
      if (res.ok) {
        modal.open(
          {
            title: "Login Successful",
            message: "Welcome back to the DECENT GUESS network",
            type: "success",
            confirmText: "CONTINUE",
          },
          () => {
            window.location.href = "/home";
          },
        );
      } else {
        modal.open({
          title: "Login Failed",
          message: res.error || "Unable to login. Please try again.",
          type: "error",
        });
      }
    } catch (e) {
      const error = e as Error;
      modal.open({
        title: "Error",
        message: error?.message || "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegister() {
    setIsLoading(true);
    try {
      const res = await register();
      if (res.ok) {
        modal.open(
          {
            title: "Registration Successful",
            message: "Your account has been created successfully",
            type: "success",
            confirmText: "CONTINUE",
          },
          () => {
            window.location.href = "/home";
          },
        );
      } else {
        modal.open({
          title: "Registration Failed",
          message: res.error || "Unable to register. Please try again.",
          type: "error",
        });
      }
    } catch (e) {
      const error = e as Error;
      modal.open({
        title: "Error",
        message: error?.message || "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen relative overflow-hidden bg-cyber-darker">
      <HexGrid />
      <Scanlines />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-cyber-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-secondary rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <GlitchText className="text-5xl md:text-6xl font-display font-black mb-4">
              DECENT GUESS NETWORK
            </GlitchText>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-cyber-primary text-sm md:text-base font-mono uppercase tracking-widest"
            >
              {walletAddress ? "ACCESS GRANTED" : "AUTHENTICATION REQUIRED"}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CyberCard glow className="relative">
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber-primary to-blue-600 p-1 shadow-cyber-lg">
                    <div className="w-full h-full rounded-full bg-cyber-dark flex items-center justify-center">
                      <Shield className="w-10 h-10 text-cyber-primary" />
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-2 border-2 border-cyber-primary border-dashed rounded-full opacity-30"
                  />
                </motion.div>
              </div>

              {walletAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-6"
                >
                  <div className="bg-cyber-dark bg-opacity-50 backdrop-blur-sm border-2 border-cyber-primary border-opacity-30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-cyber-primary" />
                      <span className="text-cyber-primary font-mono text-lg tracking-wider cyber-text-glow">
                        {formatAddress(walletAddress)}
                      </span>
                    </div>
                    <div className="text-center">
                      <CyberBadge variant="success" pulse>
                        Connected to MetaMask
                      </CyberBadge>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mb-6"
              >
                <p className="text-gray-400 font-mono text-sm">
                  {walletAddress
                    ? "ACCESS GRANTED: Ready to join the DECENT GUESS network"
                    : "Please connect your wallet to continue"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="space-y-4"
              >
                <CyberButton
                  variant="primary"
                  size="lg"
                  glow
                  icon={<LogIn className="w-5 h-5" />}
                  onClick={onLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "PROCESSING..." : "LOGIN"}
                </CyberButton>
                <CyberButton
                  variant="success"
                  size="lg"
                  glow
                  icon={<UserPlus className="w-5 h-5" />}
                  onClick={onRegister}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "PROCESSING..." : "REGISTER"}
                </CyberButton>
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-cyber-primary bg-opacity-20" />
                  <span className="text-gray-500 font-mono text-xs">OR</span>
                  <div className="flex-1 h-px bg-cyber-primary bg-opacity-20" />
                </div>
                <button
                  onClick={() => (window.location.href = "/wallet")}
                  className="w-full text-gray-400 font-mono text-sm uppercase tracking-wider transition-colors"
                >
                  ← EXIT PROTOCOL
                </button>
              </motion.div>
            </CyberCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-dark bg-opacity-30 border border-cyber-primary border-opacity-20 rounded-lg">
              <div className="w-2 h-2 bg-cyber-success rounded-full animate-pulse" />
              <span className="text-gray-400 font-mono text-xs">
                Polygon Network • Testnet Amoy
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <CyberModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        {...modal.config}
        onConfirm={modal.onConfirm || undefined}
      />
    </div>
  );
}
