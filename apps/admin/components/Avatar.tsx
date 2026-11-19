const HUES = [212, 258, 340, 16, 145, 190, 280, 100];

/** آواتار دایره‌ای با «حرف اول» نام؛ رنگ از روی خود نام (پایدار) */
export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const clean = name.trim();
  const initials = clean.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("") || "؟";
  let hash = 0;
  for (const char of clean) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hue = HUES[hash % HUES.length];
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `linear-gradient(160deg, hsl(${hue} 52% 52%), hsl(${hue} 55% 38%))`,
      }}
    >
      {initials}
    </span>
  );
}
