import { cn } from "@/lib/utils";

const SHIELD_OUTER =
  "M300 132 L422 172 V296 C422 386 370 442 300 468 C230 442 178 386 178 296 V172 Z";
const SHIELD_INNER =
  "M300 152 L406 187 V295 C406 372 362 421 300 444 C238 421 194 372 194 295 V187 Z";

/** Circuit trace paths feeding into the shield from both sides. */
const CIRCUIT_PATHS = [
  "M10 175 H92 L122 205 H188",
  "M10 255 H62 L92 285 H150 V315 H196",
  "M10 345 H80 L110 315 H185",
  "M10 430 H120 L150 400 H222",
  "M590 175 H508 L478 205 H412",
  "M590 255 H538 L508 285 H450 V315 H404",
  "M590 345 H520 L490 315 H415",
  "M590 430 H480 L450 400 H378",
];

const TRACE_DOTS = [
  { cx: 10, cy: 175 },
  { cx: 10, cy: 255 },
  { cx: 10, cy: 345 },
  { cx: 10, cy: 430 },
  { cx: 590, cy: 175 },
  { cx: 590, cy: 255 },
  { cx: 590, cy: 345 },
  { cx: 590, cy: 430 },
];

const FLOATING_DOTS = [
  { cx: 120, cy: 108, r: 3 },
  { cx: 484, cy: 120, r: 2.5 },
  { cx: 86, cy: 498, r: 2.5 },
  { cx: 516, cy: 486, r: 3 },
  { cx: 300, cy: 52, r: 2 },
  { cx: 300, cy: 548, r: 2 },
  { cx: 168, cy: 70, r: 2 },
  { cx: 438, cy: 540, r: 2 },
];

/**
 * Decorative cybersecurity shield illustration for the landing page hero.
 * Purely presentational (aria-hidden) — no interactivity.
 */
export function ShieldIllustration({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[30rem] lg:max-w-[34rem]",
        className
      )}
    >
      {/* Ambient glow behind the shield */}
      <div className="absolute inset-[16%] rounded-full bg-accent/[0.08] blur-[70px]" />

      <svg
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full"
      >
        <defs>
          <linearGradient
            id="cn-shield-stroke"
            x1="178"
            y1="132"
            x2="430"
            y2="468"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#67E8F9" />
            <stop offset="0.5" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <radialGradient
            id="cn-shield-fill"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(300 292) rotate(90) scale(186)"
          >
            <stop stopColor="#22D3EE" stopOpacity="0.16" />
            <stop offset="1" stopColor="#22D3EE" stopOpacity="0.02" />
          </radialGradient>
          <filter
            id="cn-glow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="cn-glow-soft"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric rings — outer ring rotates very slowly */}
        <circle
          cx="300"
          cy="300"
          r="252"
          stroke="#22D3EE"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeDasharray="3 12"
          className="animate-[spin_90s_linear_infinite]"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
        <circle
          cx="300"
          cy="300"
          r="222"
          stroke="#22D3EE"
          strokeOpacity="0.10"
          strokeWidth="1"
        />

        {/* Vertical accent lines above and below the shield */}
        <g stroke="#22D3EE" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round">
          <path d="M300 52 V132" />
          <path d="M300 468 V548" />
        </g>

        {/* Circuit traces */}
        <g
          stroke="#22D3EE"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {CIRCUIT_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        {/* Circuit source dots */}
        <g fill="#22D3EE">
          {TRACE_DOTS.map((dot) => (
            <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r="4" fillOpacity="0.85" />
          ))}
        </g>

        {/* Floating ambient dots */}
        <g fill="#22D3EE" fillOpacity="0.35">
          {FLOATING_DOTS.map((dot) => (
            <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={dot.r} />
          ))}
        </g>

        {/* Shield with glow */}
        <g filter="url(#cn-glow)">
          <path
            d={SHIELD_OUTER}
            stroke="url(#cn-shield-stroke)"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="url(#cn-shield-fill)"
          />
        </g>
        <path
          d={SHIELD_INNER}
          stroke="#22D3EE"
          strokeOpacity="0.22"
          strokeWidth="1"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Network mesh inside the shield */}
        <g stroke="#22D3EE" strokeOpacity="0.18" strokeWidth="1" strokeLinejoin="round">
          <path d="M300 196 L368 248 L344 348 L256 348 L232 248 Z" />
          <path d="M300 196 V418" />
          <path d="M232 248 L344 348" />
          <path d="M368 248 L256 348" />
          <path d="M232 248 H368" />
          <path d="M256 348 L300 250 L344 348" />
        </g>

        {/* CyberNexus node symbol */}
        <g filter="url(#cn-glow-soft)">
          <path
            d="M300 252 L268 310 H332 Z"
            stroke="#67E8F9"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="300" cy="252" r="11" fill="#67E8F9" />
          <circle cx="268" cy="310" r="9" fill="#22D3EE" />
          <circle cx="332" cy="310" r="9" fill="#22D3EE" />
        </g>
      </svg>
    </div>
  );
}
