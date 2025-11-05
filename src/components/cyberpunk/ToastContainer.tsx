import React from "react";
import { CyberToast } from "./Toast";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <CyberToast
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
