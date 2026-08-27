import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0E14",
        surface: {
          DEFAULT: "#121826",
          raised: "#1A2333",
          sunken: "#0D1320",
        },
        edge: {
          DEFAULT: "#1F2A3C",
          strong: "#2C3B54",
        },
        ink: {
          DEFAULT: "#E6EDF3",
          muted: "#94A6B8",
          faint: "#5C6E80",
        },
        accent: {
          DEFAULT: "#22D3EE",
          strong: "#67E8F9",
          deep: "#0E7490",
        },
        safe: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(34, 211, 238, 0.45)",
        panel: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
