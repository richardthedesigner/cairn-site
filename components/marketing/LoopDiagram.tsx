/* The Cairn loop: agent writes drafts in, you review, the next agent call reads
   approved context out. Animated dash flow, CSS-only, honours reduced-motion. */

export function LoopDiagram() {
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 760 300"
        className="mx-auto w-full max-w-3xl min-w-[560px]"
        role="img"
        aria-label="Diagram: your agent writes drafts into Cairn over MCP; you review and approve; the agent's next session reads approved context back out."
      >
        <style>{`
          .flow { stroke-dasharray: 6 8; animation: dash 1.6s linear infinite; }
          .flow-back { stroke-dasharray: 6 8; animation: dash 1.6s linear infinite reverse; }
          @keyframes dash { to { stroke-dashoffset: -14; } }
          @media (prefers-reduced-motion: reduce) { .flow, .flow-back { animation: none; } }
        `}</style>

        {/* agent node */}
        <rect x="20" y="100" width="180" height="100" rx="8" fill="var(--sunken)" stroke="var(--hairline)" />
        <text x="110" y="140" textAnchor="middle" fill="var(--text)" fontSize="15" fontWeight="500" fontFamily="var(--font-display)">
          Your agent
        </text>
        <text x="110" y="162" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">
          Claude · Cursor · MCP
        </text>

        {/* cairn node */}
        <rect x="290" y="70" width="180" height="160" rx="8" fill="var(--band)" />
        <g fill="var(--band-ink)">
          <rect x="367" y="102" width="26" height="9" rx="4.5" />
          <rect x="361" y="116" width="38" height="9" rx="4.5" />
          <rect x="355" y="130" width="50" height="9" rx="4.5" />
        </g>
        <text x="380" y="172" textAnchor="middle" fill="var(--band-ink)" fontSize="16" fontWeight="500" fontFamily="var(--font-display)">
          Cairn
        </text>
        <text x="380" y="192" textAnchor="middle" fill="var(--band-ink)" opacity="0.65" fontSize="11" fontFamily="var(--font-mono)">
          versioned · attributed
        </text>

        {/* you node */}
        <rect x="560" y="100" width="180" height="100" rx="8" fill="var(--sunken)" stroke="var(--hairline)" />
        <text x="650" y="140" textAnchor="middle" fill="var(--text)" fontSize="15" fontWeight="500" fontFamily="var(--font-display)">
          You
        </text>
        <text x="650" y="162" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">
          review · approve
        </text>

        {/* agent -> cairn (drafts in) */}
        <path d="M 200 120 H 290" fill="none" stroke="var(--copper)" strokeWidth="2" className="flow" />
        <text x="245" y="108" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">
          write_asset → draft
        </text>

        {/* cairn -> agent (approved context out) */}
        <path d="M 290 180 H 200" fill="none" stroke="var(--green)" strokeWidth="2" className="flow" />
        <text x="245" y="200" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">
          ← approved context
        </text>

        {/* cairn <-> you */}
        <path d="M 470 120 H 560" fill="none" stroke="var(--copper)" strokeWidth="2" className="flow" />
        <text x="515" y="108" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">
          review queue
        </text>
        <path d="M 560 180 H 470" fill="none" stroke="var(--green)" strokeWidth="2" className="flow" />
        <text x="515" y="200" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">
          approve ✓
        </text>
      </svg>
    </div>
  );
}
