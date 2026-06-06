import type { ReactNode } from "react";

function VisualFrame({
  label,
  title,
  caption,
  children,
  className = "",
}: {
  label: string;
  title: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-2xl border border-line bg-surface/40 ${className}`}
    >
      <div className="border-b border-line/80 px-5 py-3 sm:px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">{label}</p>
        <figcaption className="mt-1 font-display text-lg font-light text-fg sm:text-xl">
          {title}
        </figcaption>
      </div>
      <div className="px-3 py-4 sm:px-5 sm:py-6">{children}</div>
      {caption && (
        <p className="border-t border-line/60 px-5 py-3 text-xs leading-relaxed text-faint sm:px-6">
          {caption}
        </p>
      )}
    </figure>
  );
}

function SystemOverviewDiagram() {
  return (
    <svg
      viewBox="0 0 920 280"
      role="img"
      aria-label="VZTR Help connects patients and coordinators to visitors through one shared link, with future hospital sync"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="vztr-hub-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7b3fe4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0.2" />
        </linearGradient>
        <marker id="arrow-gold" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#c9a227" />
        </marker>
      </defs>

      {/* Patient node */}
      <rect x="24" y="72" width="200" height="136" rx="14" fill="#140a24" stroke="#2e1f47" strokeWidth="1.5" />
      <rect x="24" y="72" width="200" height="3" rx="1.5" fill="#7b3fe4" />
      <text x="124" y="108" textAnchor="middle" fill="#a06bf0" fontSize="10" letterSpacing="2.5">
        PATIENT / COORDINATOR
      </text>
      <text x="124" y="136" textAnchor="middle" fill="#f5f1e6" fontSize="14" fontWeight="500">
        Sets rules
      </text>
      <text x="124" y="158" textAnchor="middle" fill="#b7a8c9" fontSize="12">
        Availability & rest
      </text>
      <text x="124" y="180" textAnchor="middle" fill="#b7a8c9" fontSize="12">
        Shares one link
      </text>

      {/* Hub */}
      <rect x="330" y="48" width="260" height="184" rx="16" fill="url(#vztr-hub-glow)" stroke="#c9a227" strokeWidth="1.5" />
      <text x="460" y="88" textAnchor="middle" fill="#e6c260" fontSize="11" letterSpacing="3">
        VZTR HELP
      </text>
      <text x="460" y="118" textAnchor="middle" fill="#f5f1e6" fontSize="15" fontWeight="500">
        Single source of truth
      </text>
      <rect x="370" y="134" width="180" height="28" rx="6" fill="#0b0610" stroke="#2e1f47" />
      <text x="460" y="153" textAnchor="middle" fill="#b7a8c9" fontSize="11" fontFamily="monospace">
        vztr.help/v/••••••
      </text>
      <text x="460" y="192" textAnchor="middle" fill="#b7a8c9" fontSize="11">
        Caps · hours · no double-booking
      </text>

      {/* Visitor node */}
      <rect x="696" y="72" width="200" height="136" rx="14" fill="#140a24" stroke="#2e1f47" strokeWidth="1.5" />
      <rect x="696" y="72" width="200" height="3" rx="1.5" fill="#c9a227" />
      <text x="796" y="108" textAnchor="middle" fill="#e6c260" fontSize="10" letterSpacing="2.5">
        VISITORS
      </text>
      <text x="796" y="136" textAnchor="middle" fill="#f5f1e6" fontSize="14" fontWeight="500">
        Self-serve slots
      </text>
      <text x="796" y="158" textAnchor="middle" fill="#b7a8c9" fontSize="12">
        Parking & check-in info
      </text>
      <text x="796" y="180" textAnchor="middle" fill="#b7a8c9" fontSize="12">
        No account required
      </text>

      {/* Arrows */}
      <line x1="224" y1="140" x2="328" y2="140" stroke="#c9a227" strokeWidth="1.5" markerEnd="url(#arrow-gold)" />
      <line x1="592" y1="140" x2="694" y2="140" stroke="#c9a227" strokeWidth="1.5" markerEnd="url(#arrow-gold)" />

      {/* Hospital future layer */}
      <rect x="330" y="248" width="260" height="24" rx="6" fill="none" stroke="#2e1f47" strokeWidth="1" strokeDasharray="5 4" />
      <text x="460" y="264" textAnchor="middle" fill="#6e5f86" fontSize="10" letterSpacing="1.5">
        FUTURE · HOSPITAL SYNC · EXAMS · REST ALERTS · FRONT DESK
      </text>
      <line x1="460" y1="232" x2="460" y2="248" stroke="#2e1f47" strokeWidth="1" strokeDasharray="4 3" />
    </svg>
  );
}

function DualFlowDiagram() {
  return (
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="Patient and visitor flows run in parallel through one shared scheduling link"
      className="h-auto w-full"
    >
      <defs>
        <marker id="flow-dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
          <circle cx="3" cy="3" r="2.5" fill="#c9a227" />
        </marker>
      </defs>

      {/* Lanes */}
      <rect x="16" y="24" width="248" height="312" rx="12" fill="#140a24" stroke="#2e1f47" />
      <rect x="16" y="24" width="248" height="2" rx="1" fill="#7b3fe4" />
      <text x="140" y="52" textAnchor="middle" fill="#a06bf0" fontSize="10" letterSpacing="2">
        PATIENT FLOW
      </text>

      <rect x="296" y="24" width="248" height="312" rx="12" fill="#140a24" stroke="#2e1f47" />
      <rect x="296" y="24" width="248" height="2" rx="1" fill="#c9a227" />
      <text x="420" y="52" textAnchor="middle" fill="#e6c260" fontSize="10" letterSpacing="2">
        VISITOR FLOW
      </text>

      {/* Patient steps */}
      {[
        { y: 78, t: "Open visit window" },
        { y: 138, t: "Set hospital rules" },
        { y: 198, t: "Mark availability" },
        { y: 258, t: "Share one link" },
      ].map((s, i) => (
        <g key={s.t}>
          <circle cx="44" cy={s.y} r="10" fill="#0b0610" stroke="#7b3fe4" strokeWidth="1.5" />
          <text x="44" y={s.y + 4} textAnchor="middle" fill="#a06bf0" fontSize="10">
            {i + 1}
          </text>
          <rect x="64" y={s.y - 14} width="180" height="28" rx="6" fill="#0b0610" stroke="#2e1f47" />
          <text x="154" y={s.y + 4} textAnchor="middle" fill="#f5f1e6" fontSize="11">
            {s.t}
          </text>
          {i < 3 && (
            <line x1="44" y1={s.y + 10} x2="44" y2={s.y + 38} stroke="#2e1f47" strokeWidth="1" />
          )}
        </g>
      ))}

      {/* Visitor steps */}
      {[
        { y: 78, t: "Open invite link" },
        { y: 138, t: "Read rules & parking" },
        { y: 198, t: "Claim open slot" },
        { y: 258, t: "Confirm & arrive" },
      ].map((s, i) => (
        <g key={s.t}>
          <circle cx="324" cy={s.y} r="10" fill="#0b0610" stroke="#c9a227" strokeWidth="1.5" />
          <text x="324" y={s.y + 4} textAnchor="middle" fill="#e6c260" fontSize="10">
            {i + 1}
          </text>
          <rect x="344" y={s.y - 14} width="180" height="28" rx="6" fill="#0b0610" stroke="#2e1f47" />
          <text x="434" y={s.y + 4} textAnchor="middle" fill="#f5f1e6" fontSize="11">
            {s.t}
          </text>
          {i < 3 && (
            <line x1="324" y1={s.y + 10} x2="324" y2={s.y + 38} stroke="#2e1f47" strokeWidth="1" />
          )}
        </g>
      ))}

      {/* Bridge at share link */}
      <path
        d="M 244 258 C 270 258, 270 258, 296 138"
        fill="none"
        stroke="#c9a227"
        strokeWidth="1.25"
        strokeDasharray="6 4"
        markerEnd="url(#flow-dot)"
      />
      <text x="280" y="210" textAnchor="middle" fill="#6e5f86" fontSize="9" letterSpacing="1">
        ONE LINK
      </text>
    </svg>
  );
}

function ResearchInsightsChart() {
  const bars = [
    { label: "Call patient & caregiver", value: 50, note: "before visiting" },
    { label: "Schedule via coordinator", value: 62.5, note: "not direct with patient" },
    { label: "Prefer text availability", value: 67, note: "over icon-only UI" },
  ];

  return (
    <svg
      viewBox="0 0 560 360"
      role="img"
      aria-label="Research findings from patient and visitor interviews"
      className="h-auto w-full"
    >
      <text x="28" y="44" fill="#e6c260" fontSize="10" letterSpacing="2.5">
        RESEARCH SIGNALS
      </text>
      <text x="28" y="68" fill="#b7a8c9" fontSize="12">
        Berkeley capstone · interviews & usability tests
      </text>

      {bars.map((bar, i) => {
        const y = 108 + i * 82;
        const width = (bar.value / 70) * 420;
        return (
          <g key={bar.label}>
            <text x="28" y={y} fill="#f5f1e6" fontSize="12">
              {bar.label}
            </text>
            <rect x="28" y={y + 10} width="504" height="8" rx="4" fill="#0b0610" stroke="#2e1f47" />
            <rect x="28" y={y + 10} width={width} height="8" rx="4" fill="#7b3fe4" opacity="0.85" />
            <rect x={28 + width - 2} y={y + 8} width="4" height="12" rx="2" fill="#c9a227" />
            <text x="532" y={y + 18} textAnchor="end" fill="#e6c260" fontSize="14" fontWeight="600">
              {bar.value}%
            </text>
            <text x="28" y={y + 38} fill="#6e5f86" fontSize="10">
              {bar.note}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ProductUiPreview() {
  return (
    <svg
      viewBox="0 0 920 300"
      role="img"
      aria-label="Coordinator dashboard and visitor invite side by side"
      className="h-auto w-full"
    >
      {/* Coordinator panel */}
      <rect x="24" y="32" width="420" height="236" rx="14" fill="#140a24" stroke="#2e1f47" />
      <rect x="24" y="32" width="420" height="36" rx="14" fill="#1a0a2e" />
      <rect x="24" y="56" width="420" height="12" fill="#1a0a2e" />
      <circle cx="48" cy="50" r="5" fill="#7b3fe4" />
      <text x="68" y="54" fill="#f5f1e6" fontSize="12" fontWeight="500">
        Coordinator · Room 412
      </text>
      <text x="68" y="88" fill="#6e5f86" fontSize="10" letterSpacing="1.5">
        {"TODAY'S AVAILABILITY"}
      </text>

      {[
        { y: 108, time: "2:00 PM", status: "Available", color: "#7b3fe4" },
        { y: 148, time: "4:00 PM", status: "1 of 2 booked", color: "#c9a227" },
        { y: 188, time: "Tomorrow", status: "Rest day", color: "#6e5f86" },
      ].map((row) => (
        <g key={row.time}>
          <rect x="48" y={row.y} width="372" height="32" rx="8" fill="#0b0610" stroke="#2e1f47" />
          <text x="68" y={row.y + 20} fill="#b7a8c9" fontSize="11">
            {row.time}
          </text>
          <text x="400" y={row.y + 20} textAnchor="end" fill={row.color} fontSize="11" fontWeight="500">
            {row.status}
          </text>
        </g>
      ))}

      <rect x="48" y="232" width="140" height="24" rx="6" fill="#7b3fe4" opacity="0.2" stroke="#7b3fe4" />
      <text x="118" y="248" textAnchor="middle" fill="#a06bf0" fontSize="10">
        Pause requests
      </text>

      {/* Visitor panel */}
      <rect x="476" y="32" width="420" height="236" rx="14" fill="#140a24" stroke="#2e1f47" />
      <rect x="476" y="32" width="420" height="36" rx="14" fill="#1a0a2e" />
      <rect x="476" y="56" width="420" height="12" fill="#1a0a2e" />
      <circle cx="500" cy="50" r="5" fill="#c9a227" />
      <text x="520" y="54" fill="#f5f1e6" fontSize="12" fontWeight="500">
        Visitor invite
      </text>
      <text x="520" y="88" fill="#6e5f86" fontSize="10" letterSpacing="1.5">
        PICK A TIME · MAX 2 VISITORS · 11AM–8PM
      </text>

      <rect x="500" y="108" width="372" height="36" rx="8" fill="#0b0610" stroke="#c9a227" strokeWidth="1.25" />
      <text x="520" y="130" fill="#e6c260" fontSize="11">
        Wed 3:00 PM — Open
      </text>

      <rect x="500" y="152" width="372" height="36" rx="8" fill="#0b0610" stroke="#2e1f47" opacity="0.6" />
      <text x="520" y="174" fill="#6e5f86" fontSize="11">
        Wed 4:00 PM — Full
      </text>

      <text x="520" y="212" fill="#6e5f86" fontSize="10" letterSpacing="1">
        PARKING · GARAGE B · VALIDATION AT DESK
      </text>

      <rect x="500" y="224" width="372" height="28" rx="6" fill="none" stroke="#2e1f47" strokeDasharray="4 3" />
      <text x="520" y="242" fill="#6e5f86" fontSize="10" fontFamily="monospace">
        Check-in · Main entrance · Room 412
      </text>
    </svg>
  );
}

export function VztrHelpVisualExplainer() {
  return (
    <section className="space-y-6" aria-labelledby="vztr-visuals-heading">
      <div className="max-w-2xl">
        <h2
          id="vztr-visuals-heading"
          className="font-display text-sm font-medium uppercase tracking-[0.2em] text-gold"
        >
          At a glance
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          One link replaces the group chat. Patients set the rules; visitors self-serve;
          hospitals sync in the roadmap.
        </p>
      </div>

      <VisualFrame
        label="System map"
        title="Three sides, one schedule"
        caption="The patient or coordinator owns the calendar. Visitors book through a single link. Hospital systems receive visitor data automatically in the next phase."
      >
        <SystemOverviewDiagram />
      </VisualFrame>

      <div className="grid gap-6 lg:grid-cols-2">
        <VisualFrame
          label="User flows"
          title="Parallel paths, shared link"
          caption="Patient-side setup and visitor-side booking stay in sync — no duplicate calls, no surprise arrivals."
        >
          <DualFlowDiagram />
        </VisualFrame>

        <VisualFrame
          label="Research"
          title="What we measured"
          caption="Findings from Berkeley capstone interviews and moderated usability sessions — not assumptions."
        >
          <ResearchInsightsChart />
        </VisualFrame>
      </div>

      <VisualFrame
        label="Product surface"
        title="Coordinator and visitor views"
        caption="Availability, capacity, rest days, parking, and check-in guidance — visible before anyone arrives at the hospital."
      >
        <ProductUiPreview />
      </VisualFrame>
    </section>
  );
}
