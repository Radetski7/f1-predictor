"use client";
import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
};

export default function Modal({ isOpen, onClose, type, title, message }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: "🏁",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  const colors = {
    success: "#00d26a",
    error: "#ff6b6b",
    warning: "#ffc107",
    info: "#3b82f6",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon" style={{ backgroundColor: `${colors[type]}20`, color: colors[type] }}>
          {icons[type]}
        </div>
        <h2 className="modal-title" style={{ color: colors[type] }}>{title}</h2>
        <p className="modal-message">{message}</p>
        <button 
          className="modal-button"
          onClick={onClose}
          style={{ 
            backgroundColor: colors[type],
            boxShadow: `0 4px 15px ${colors[type]}40`
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}