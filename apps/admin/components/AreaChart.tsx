interface AreaChartProps {
  /** مقادیر روزانه (از قدیم به جدید) */
  values: number[];
  /** برچسب‌های محور افقی */
  labels: string[];
  ariaLabel: string;
  /** واحد tooltip */
  unit?: string;
  /** رنگ خط/گرادیان (پیش‌فرض طلایی برند) */
  stroke?: string;
  /** شناسهٔ یکتای گرادیان (هر چند نمودار در یک صفحه باشند تداخل نکنند) */
  gradientId: string;
}

/** تبدیل نقطه‌ها به مسیر نرم (Catmull-Rom → Bézier) */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`;
  }
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/** نمودار ناحیه‌ای نرم با گرادیان — مطابق زبان بصری داشبوردهای مدرن */
export default function AreaChart({ values, labels, ariaLabel, unit = "", stroke = "#b8915a", gradientId }: AreaChartProps) {
  const width = 720;
  const height = 210;
  const padTop = 16;
  const padBottom = 26;
  const padSides = 10;
  const innerW = width - padSides * 2;
  const innerH = height - padTop - padBottom;
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? innerW / (values.length - 1) : innerW;

  const points = values.map((value, index) => ({
    x: padSides + index * stepX,
    y: padTop + innerH - (value / max) * innerH,
  }));
  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1]?.x.toFixed(1) ?? padSides},${(padTop + innerH).toFixed(1)} L ${padSides},${(padTop + innerH).toFixed(1)} Z`;
  const gridValues = [1, 0.5, 0].map((fraction) => Math.round(max * fraction));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className="chart" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.38" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* خطوط راهنمای افقی */}
      {gridValues.map((value, index) => {
        const y = padTop + innerH * (1 - value / max);
        return (
          <g key={index}>
            <line x1={padSides} x2={width - padSides} y1={y} y2={y} stroke="rgba(27,42,59,0.1)" strokeDasharray="4 6" />
            <text x={padSides} y={y - 3} fontSize="9" fill="rgba(27,42,59,0.5)">{value}</text>
          </g>
        );
      })}

      {/* ناحیه + خط */}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

      {/* نقطه‌ها (فقط برای بازه‌های کوتاه) */}
      {values.length <= 14 &&
        points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3" fill="#fff" stroke={stroke} strokeWidth="1.6">
            <title>{`${labels[index] ?? ""}: ${values[index]}${unit ? " " + unit : ""}`}</title>
          </circle>
        ))}

      {/* محور افقی — هر پنج روز */}
      {labels.map((label, index) => {
        if (index % 5 !== 0 && index !== labels.length - 1) return null;
        return (
          <text key={index} x={padSides + index * stepX} y={height - 8} fontSize="9" fill="rgba(27,42,59,0.55)" textAnchor="middle">
            {label}
          </text>
        );
      })}
    </svg>
  );
}
