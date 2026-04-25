"use client";

import { useEffect } from "react";
import { X, AlertTriangle, Trash2, CheckCircle, Info } from "lucide-react";

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = "error" | "success" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const TOAST_STYLES: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  error:   { bg: "bg-red-50 border-red-200 text-red-800",    icon: <X size={16} className="text-red-500 shrink-0" /> },
  success: { bg: "bg-green-50 border-green-200 text-green-800", icon: <CheckCircle size={16} className="text-green-500 shrink-0" /> },
  warning: { bg: "bg-amber-50 border-amber-200 text-amber-800", icon: <AlertTriangle size={16} className="text-amber-500 shrink-0" /> },
  info:    { bg: "bg-blue-50 border-blue-200 text-blue-800",  icon: <Info size={16} className="text-blue-500 shrink-0" /> },
};

export function Toast({ message, type = "error", onClose }: ToastProps) {
  const { bg, icon } = TOAST_STYLES[type];

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm animate-in slide-in-from-bottom-2 ${bg}`}>
      {icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger:  { icon: <Trash2 size={28} className="text-red-500" />,        btn: "bg-red-600 hover:bg-red-700",    ring: "bg-red-50"    },
  warning: { icon: <AlertTriangle size={28} className="text-amber-500" />, btn: "bg-amber-500 hover:bg-amber-600", ring: "bg-amber-50"  },
  info:    { icon: <Info size={28} className="text-blue-500" />,          btn: "bg-blue-600 hover:bg-blue-700",  ring: "bg-blue-50"   },
};

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { icon, btn, ring } = VARIANT_STYLES[variant];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-16 h-16 rounded-full ${ring} flex items-center justify-center mx-auto mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-sm text-gray-500 mb-6">{message}</div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${btn}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
