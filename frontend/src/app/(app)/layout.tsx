"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/app/site-header";
import { ChatBot } from "@/components/app/chatbot";
import { Toaster } from "@/components/ui/toast";
import { NotificationPoller } from "@/components/app/notification-poller";

/**
 * App shell. The Security Overview console route (/dashboard) renders its
 * own ConsoleTopNav inside the app frame, so the global marketing chrome
 * (header / footer / chatbot) is suppressed there to avoid duplicate nav.
 * Every other route keeps the existing chrome unchanged. Toasts and the
 * notification poller stay mounted on all routes.
 */
export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isConsoleFrame = pathname === "/dashboard";

  return (
    <div className="flex min-h-screen flex-col">
      {!isConsoleFrame && <SiteHeader />}
      <main className={isConsoleFrame ? "flex-1" : "flex-1 pt-16"}>{children}</main>
      {!isConsoleFrame && <SiteFooter />}
      {!isConsoleFrame && <ChatBot />}
      <Toaster />
      <NotificationPoller />
    </div>
  );
}
