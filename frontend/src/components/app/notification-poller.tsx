"use client";

import { useEffect, useRef } from "react";
import { apiFetch, getStoredToken } from "@/lib/api";
import { toastSuccess, toastError, toastInfo } from "@/components/ui/toast";

interface Notification {
  id: string;
  message: string;
  status: string;
  createdAt: string;
}

export function NotificationPoller() {
  const seenRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!getStoredToken()) return;

    async function poll() {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        const data = await apiFetch<Notification[]>("/api/notifications?unread_only=true&limit=5");
        for (const n of data) {
          if (seenRef.current.has(n.id)) continue;
          seenRef.current.add(n.id);

          const msg = n.message.toLowerCase();
          if (msg.includes("started") || msg.includes("queued")) {
            toastInfo(n.message);
          } else if (msg.includes("finished") || msg.includes("completed")) {
            toastSuccess(n.message);
          } else if (msg.includes("failed") || msg.includes("error")) {
            toastError(n.message);
          } else {
            toastSuccess(n.message);
          }

          // Mark as read after showing
          try {
            await apiFetch(`/api/notifications/${n.id}/read`, { method: "PATCH" });
          } catch {}
        }
      } catch {
        // silent
      } finally {
        inFlightRef.current = false;
      }
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
