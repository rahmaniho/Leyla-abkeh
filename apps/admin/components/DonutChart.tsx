interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  ariaLabel: string;
  /** متن وسط دایره */
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

/** نمودار دوناتی SVG با راهنما */
export default function DonutChart({ segments, ariaLabel, centerLabel, centerValue, size = 170 }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label={ariaLabel}>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--bg-2)" strokeWidth="19" />
        {total > 0 &&
          segments.map((segment, index) => {
            if (segment.value === 0) return null;
            const length = (segment.value / total) * circumference;
            const dash = `${length.toFixed(2)} ${(circumference - length).toFixed(2)}`;
            const dashOffset = -offset;
            offset += length;
            return (
              <circle
                key={index}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="19"
                strokeLinecap="butt"
                strokeDasharray={dash}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 80 80)"
              >
                <title>{`${segment.label}: ${segment.value}`}</title>
              </circle>
            );
          })}
        <text x="80" y="76" textAnchor="middle" fontSize="21" fontWeight="800" fill="#0e1a26">
          {centerValue ?? (total ? String(total) : "۰")}
        </text>
        {centerLabel && (
          <text x="80" y="97" textAnchor="middle" fontSize="9.5" fill="rgba(27,42,59,0.6)">
            {centerLabel}
          </text>
        )}
      </svg>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: 150 }}>
        {segments.map((segment, index) => (
          <li key={index} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.76rem" }}>
            <span style={{ width: 11, height: 11, borderRadius: 4, background: segment.color, flex: "0 0 auto" }} aria-hidden="true" />
            <span style={{ color: "var(--text-2)", flex: 1 }}>{segment.label}</span>
            <b style={{ color: "var(--ink-deep)", fontVariantNumeric: "tabular-nums" }}>{segment.value.toLocaleString("fa-IR")}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
