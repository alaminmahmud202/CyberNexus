"use client";

import { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "loading" | "info" | "warning";

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

let toastId = 0;

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  loading: Loader2,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<ToastType, string> = {
  success: "border-safe/30 bg-safe/10 text-safe",
  error: "border-danger/30 bg-danger/10 text-danger",
  loading: "border-accent/30 bg-accent/10 text-accent",
  info: "border-accent/30 bg-accent/10 text-accent",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

const TITLE_STYLES: Record<ToastType, string> = {
  success: "text-safe",
  error: "text-danger",
  loading: "text-accent",
  info: "text-accent",
  warning: "text-warning",
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (toast.type === "loading") return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const Icon = ICONS[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-card hover:shadow-card-hover backdrop-blur transition-all duration-300",
        STYLES[toast.type],
        visible && !exiting
          ? "animate-slide-up opacity-100"
          : "opacity-0 translate-y-2"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className={cn("mt-0.5 h-5 w-5 shrink-0 flex-shrink-0", toast.type === "loading" && "animate-spin")}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={cn("font-semibold text-body-sm mb-1", TITLE_STYLES[toast.type])}>
            {toast.title}
          </p>
        )}
        <p className="text-body-sm text-ink-muted leading-snug">{toast.message}</p>
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="mt-2 text-body-sm font-medium underline underline-offset-2 hover:no-underline transition-colors"
            style={{ color: `var(--tw-text-opacity, 1)` }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.type !== "loading" && (
        <button
          type="button"
          onClick={() => {
            setExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="shrink-0 rounded-lg p-1 opacity-50 transition-opacity hover:opacity-100 hover:bg-white/5"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

const toasts: Toast[] = [];
let listeners: Array<() => void> = [];

function emitChange() {
  for (const l of listeners) l();
}

export function toast(message: string, type: ToastType = "info", duration?: number) {
  const id = String(++toastId);
  const t: Toast = { id, message, type, duration };
  toasts.push(t);
  emitChange();
  return id;
}

export function toastSuccess(title: string, message?: string, duration?: number) {
  return toast(message || title, "success", duration);
}

export function toastError(title: string, message?: string, duration?: number) {
  return toast(message || title, "error", duration ?? 8000);
}

export function toastLoading(title: string, message?: string) {
  return toast(message || title, "loading");
}

export function toastInfo(title: string, message?: string, duration?: number) {
  return toast(message || title, "info", duration);
}

export function toastWarning(title: string, message?: string, duration?: number) {
  return toast(message || title, "warning", duration ?? 7000);
}

export function toastWithAction(
  title: string,
  message: string,
  action: { label: string; onClick: () => void },
  type: ToastType = "info",
  duration?: number
) {
  const id = String(++toastId);
  const t: Toast = { id, title, message, type, duration, action };
  toasts.push(t);
  emitChange();
  return id;
}

export function toastUpdate(id: string, message: string, type: ToastType = "info", duration?: number) {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx !== -1) {
    toasts[idx] = { ...toasts[idx], message, type, duration };
    emitChange();
  }
}

export function toastDismiss(id: string) {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx !== -1) {
    toasts.splice(idx, 1);
    emitChange();
  }
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    function sync() {
      setItems([...toasts]);
    }
    listeners.push(sync);
    return () => {
      listeners = listeners.filter((l) => l !== sync);
    };
  }, []);

  const handleRemove = useCallback((id: string) => {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx !== -1) {
      toasts.splice(idx, 1);
      emitChange();
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={handleRemove} />
      ))}
    </div>
  );
}