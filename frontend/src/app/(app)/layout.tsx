import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/app/site-header";
import { ChatBot } from "@/components/app/chatbot";
import { Toaster } from "@/components/ui/toast";
import { NotificationPoller } from "@/components/app/notification-poller";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
      <ChatBot />
      <Toaster />
      <NotificationPoller />
    </div>
  );
}
