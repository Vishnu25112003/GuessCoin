import { useState, useCallback } from "react";

interface ModalConfig {
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info" | "confirm";
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const useCyberModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig>({
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  const open = useCallback(
    (modalConfig: ModalConfig, onConfirm?: () => void) => {
      setConfig({ confirmText: "OK", ...modalConfig });
      setOnConfirmCallback(() => onConfirm || null);
      setIsOpen(true);
    },
    [],
  );

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    config,
    open,
    close,
    onConfirm: onConfirmCallback,
  };
};
