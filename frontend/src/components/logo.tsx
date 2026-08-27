import { cn } from "@/lib/utils";

export function CyberNexusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-8 w-8 text-accent", className)}
    >
      <path
        d="M16 3 L28 7.5 V14 C28 21.5 23.2 26.6 16 29 C8.8 26.6 4 21.5 4 14 V7.5 Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M16 8.5 V14 M16 14 L11 19.5 M16 14 L21 19.5"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <circle cx="16" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="16" cy="14" r="2.3" fill="currentColor" />
      <circle cx="11" cy="19.5" r="1.5" fill="currentColor" />
      <circle cx="21" cy="19.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function CyberNexusLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <CyberNexusMark className="h-7 w-7" />
      <span className="whitespace-nowrap font-mono text-sm font-bold uppercase tracking-[0.28em] text-ink">
        Cyber<span className="text-accent">Nexus</span>
      </span>
    </span>
  );
}
