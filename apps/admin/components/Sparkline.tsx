interface SparklineProps {
  values: number[];
  /** رنگ خط (پیش‌فرض طلایی برند) */
  color?: string;
  width?: number;
  height?: number;
  ariaLabel?: string;
}

/** نمودار خطی ریز برای داخل کارت‌های KPI */
export default function Sparkline({ values, color = "#b8915a", width = 120, height = 38, ariaLabel }: SparklineProps) {
  if (values.length < 2) {
    return <svg viewBox={`0 0 ${width} ${height}`} className="kpi-spark" role="img" aria-label={ariaLabel ?? "روند"} />;
  }
  const max = Math.max(...values, 1);
  const stepX = width / (values.length - 1);
  const points = values.map((value, index) => ({ x: index * stepX, y: height - 4 - (value / max) * (height - 10) }));
  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="kpi-spark" role="img" aria-label={ariaLabel ?? "روند"} preserveAspectRatio="none">
      <polygon points={area} fill={color} opacity="0.14" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
