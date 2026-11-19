interface BarChartProps {
  /** مقادیر روزانه (از قدیم به جدید) */
  values: number[];
  /** برچسب‌های محور افقی (نمایش کوتاه) */
  labels: string[];
  /** عنوان کوتاه برای دسترسی‌پذیری */
  ariaLabel: string;
  /** واحد روی tooltip */
  unit?: string;
}

/**
 * نمودار میله‌ای ساده و سبک با SVG (بدون کتابخانهٔ خارجی)
 * RTL: قدیمی‌ترین داده سمت راست تا جدیدترین سمت چپ.
 */
export default function BarChart({ values, labels, ariaLabel, unit = "" }: BarChartProps) {
  const width = 640;
  const height = 168;
  const paddingTop = 18;
  const paddingBottom = 26;
  const paddingSides = 8;
  const innerHeight = height - paddingTop - paddingBottom;
  const max = Math.max(1, ...values);
  const slot = (width - paddingSides * 2) / values.length;
  const barWidth = Math.max(3, Math.min(18, slot * 0.62));

  const gridValues = [1, 0.5, 0].map((fraction) => Math.round(max * fraction));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="chart"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* خطوط راهنما */}
      {gridValues.map((value, index) => {
        const y = paddingTop + innerHeight * (1 - value / max);
        return (
          <g key={index}>
            <line x1={paddingSides} x2={width - paddingSides} y1={y} y2={y} stroke="rgba(26,42,58,0.12)" strokeDasharray="3 5" />
            <text x={paddingSides} y={y - 2} fontSize="9" fill="rgba(26,42,58,0.55)">
              {value}
            </text>
          </g>
        );
      })}

      {values.map((value, index) => {
        const x = paddingSides + index * slot + (slot - barWidth) / 2;
        const barHeight = value === 0 ? 2 : (value / max) * innerHeight;
        const y = paddingTop + innerHeight - barHeight;
        const label = labels[index] ?? "";
        return (
          <g key={index}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx={Math.min(4, barWidth / 2)} fill="url(#goldGradient)">
              <title>{`${label}: ${value}${unit ? " " + unit : ""}`}</title>
            </rect>
          </g>
        );
      })}

      {/* برچسب‌های محور افقی — هر پنج روز یک‌بار */}
      {labels.map((label, index) => {
        if (index % 5 !== 0 && index !== labels.length - 1) return null;
        const x = paddingSides + index * slot + slot / 2;
        return (
          <text key={index} x={x} y={height - 8} fontSize="9" fill="rgba(26,42,58,0.6)" textAnchor="middle">
            {label}
          </text>
        );
      })}

      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4b483" />
          <stop offset="100%" stopColor="#b8915a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
