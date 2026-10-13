import { AlertCenterCard } from "@/components/dashboard/overview/alert-center-card";
import { DetectionTrendCard } from "@/components/dashboard/overview/detection-trend-card";
import { ResponseStatusCard } from "@/components/dashboard/overview/response-status-card";
import { SecurityThreatsCard } from "@/components/dashboard/overview/security-threats-card";
import { ThreatTacticsCard } from "@/components/dashboard/overview/threat-tactics-card";

/**
 * Standalone card grid (DESIGN_SPEC_DASHBOARD.md §8b) — the five overview
 * widgets rendered as a components gallery directly on the light canvas,
 * without the app frame / console nav / page header. Purely a review route;
 * it does not affect any other route.
 */
export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <header className="mb-8">
          <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-[#111111]">
            Security Overview — Component Showcase
          </h1>
          <p className="mt-1 text-[13px] text-[#6B6B6B]">
            The five dashboard widgets, standalone for design review.
          </p>
        </header>

        {/* Same grid as the app frame: row 1 three × 4 cols, row 2 = 7 + 5 (§4) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:min-h-[360px] [&>section]:h-full">
            <ThreatTacticsCard />
          </div>
          <div className="lg:col-span-4 lg:min-h-[360px] [&>section]:h-full">
            <DetectionTrendCard />
          </div>
          <div className="lg:col-span-4 lg:min-h-[360px] [&>section]:h-full">
            <AlertCenterCard />
          </div>
          <div className="lg:col-span-7 lg:min-h-[340px] [&>section]:h-full">
            <SecurityThreatsCard />
          </div>
          <div className="lg:col-span-5 lg:min-h-[340px] [&>section]:h-full">
            <ResponseStatusCard />
          </div>
        </div>
      </div>
    </div>
  );
}
