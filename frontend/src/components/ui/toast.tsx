"use client";

import { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "loading" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastId = 0;

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  loading: Loader2,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  error: "border-danger/30 bg-danger/10 text-danger",
  loading: "border-accent/30 bg-accent/10 text-accent",
  info: "border-accent/30 bg-accent/10 text-accent",
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
    }, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const Icon = ICONS[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl shadow-black/30 backdrop-blur transition-all duration-300",
        STYLES[toast.type],
        visible && !exiting
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0"
      )}
      role="alert"
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          toast.type === "loading" && "animate-spin"
        )}
      />
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      {toast.type !== "loading" && (
        <button
          type="button"
          onClick={() => {
            setExiting(true);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
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

export function toastSuccess(message: string) {
  return toast(message, "success");
}

export function toastError(message: string) {
  return toast(message, "error", 6000);
}

export function toastLoading(message: string) {
  return toast(message, "loading");
}

export function toastInfo(message: string) {
  return toast(message, "info");
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
    <div className="fixed bottom-24 right-6 z-[60] flex w-[360px] flex-col gap-2">
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={handleRemove} />
      ))}
    </div>
  );
}
