import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface DeltaProps {
  current: number;
  previous: number;
}

/** دلتای درصدی واقعی (فقط وقتی مقایسهٔ واقعی وجود دارد) */
export function Delta({ current, previous }: DeltaProps) {
  if (previous === 0 && current === 0) return <span className="delta flat">بدون تغییر</span>;
  if (previous === 0) return <span className="delta up">جدید ↑</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return <span className="delta flat">۰٪</span>;
  const up = change > 0;
  return <span className={`delta ${up ? "up" : "down"}`}>{Math.abs(change).toLocaleString("fa-IR")}٪ {up ? "↑" : "↓"}</span>;
}

interface StatCardProps {
  icon: LucideIcon;
  tone: "blue" | "purple" | "green" | "pink" | "orange";
  label: string;
  value: string | number;
  sub?: string;
  delta?: { current: number; previous: number } | null;
  spark?: number[];
  href?: string;
}

/** کارت KPI استاندارد داشبورد (آیکون دایره‌ای رنگی، عدد بزرگ، دلتای واقعی) */
const TONE_TEXT: Record<NonNullable<StatCardProps["tone"]>, string> = {
  blue: "var(--blue-deep)",
  purple: "var(--purple-deep)",
  green: "var(--green-deep)",
  pink: "var(--pink-deep)",
  orange: "var(--orange-deep)",
};

export default function StatCard({ icon: Icon, tone, label, value, sub, delta, spark, href }: StatCardProps) {
  const content = (
    <>
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <span className={`kpi-icon ${tone}`}>
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
      <div className="kpi-value" style={{ color: TONE_TEXT[tone] }}>{typeof value === "number" ? value.toLocaleString("fa-IR") : value}</div>
      <div className="kpi-foot">
        {sub && <span className="kpi-sub">{sub}</span>}
        {delta && <Delta {...delta} />}
      </div>
      {spark && spark.length > 1 && (
        <svg viewBox="0 0 120 36" className="kpi-spark" preserveAspectRatio="none" aria-hidden="true">
          {(() => {
            const max = Math.max(...spark, 1);
            const step = 120 / (spark.length - 1);
            const points = spark.map((v, i) => `${(i * step).toFixed(1)},${(34 - (v / max) * 30).toFixed(1)}`);
            const line = points.join(" ");
            return (
              <>
                <polygon points={`${line} 120,36 0,36`} fill="var(--blue)" opacity="0.12" />
                <polyline points={line} fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
              </>
            );
          })()}
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="card kpi-card">
        {content}
      </Link>
    );
  }
  return <div className="card kpi-card">{content}</div>;
}
