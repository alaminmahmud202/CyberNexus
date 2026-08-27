"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  message: string;
  status: string;
  createdAt: string;
}

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await apiFetch<{ count: number }>("/api/notifications/unread-count");
      setUnread(data.count);
    } catch {}
  }, []);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Notification[]>("/api/notifications?limit=8");
      setItems(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (!open) return;
    fetchRecent();
  }, [open, fetchRecent]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, status: "read" })));
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-slate-950">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] rounded-xl border border-edge bg-surface shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {loading && (
              <p className="py-6 text-center text-sm text-ink-muted">Loading...</p>
            )}
            {!loading && items.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-muted">No notifications</p>
            )}
            {!loading && items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "border-b border-edge/60 px-4 py-3 last:border-0",
                  n.status === "unread" && "bg-accent/5"
                )}
              >
                <p className={cn("text-sm leading-snug", n.status === "unread" ? "text-ink" : "text-ink-muted")}>
                  {n.message}
                </p>
                <p className="mt-1 text-[11px] text-ink-faint">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
