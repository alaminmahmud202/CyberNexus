"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, getStoredToken } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm CyberNexus AI, your cybersecurity assistant. I can help you understand scan results, explain security concepts, and provide guidance on securing your infrastructure. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    if (!getStoredToken()) {
      setError("Please sign in to use the chatbot.");
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await apiFetch<{ response: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed, history }),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to get response";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error: ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          open
            ? "bg-surface border border-edge text-ink hover:bg-surface-raised"
            : "bg-accent text-slate-950 shadow-glow hover:bg-accent-strong"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[380px] flex-col rounded-xl border border-edge bg-surface shadow-2xl shadow-black/40 sm:w-[420px]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-edge px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold">CyberNexus AI</h3>
              <p className="text-[11px] text-ink-faint">
                Powered by Google Gemini
              </p>
            </div>
            <div className="flex h-2.5 w-2.5 rounded-full bg-green-500" title="Online" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: "400px" }}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2.5",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                      <Bot className="h-3.5 w-3.5 text-accent" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-accent text-slate-950"
                        : "bg-surface-raised text-ink border border-edge"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-raised border border-edge">
                      <User className="h-3.5 w-3.5 text-ink-muted" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                    <Bot className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl bg-surface-raised border border-edge px-3.5 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span className="text-sm text-ink-muted">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="border-t border-edge px-4 py-2">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-edge px-4 py-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about security..."
                className="flex-1"
                disabled={loading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || loading}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
