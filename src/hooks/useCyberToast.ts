import { useState, useCallback, useRef } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export const useCyberToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const show = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = nextIdRef.current++;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    },
    [],
  );

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    show,
    remove,
    success: (message: string) => show(message, "success"),
    error: (message: string) => show(message, "error"),
    info: (message: string) => show(message, "info"),
  };
};
