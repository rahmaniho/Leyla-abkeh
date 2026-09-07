import Reveal from "./Reveal";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
  align?: "center" | "start";
}

/** عنوان مشترک بخش‌ها با برچسب طلایی، عنوان و توضیح */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  dark = false,
  align = "center",
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12.5px] font-bold tracking-wide ${
            dark
              ? "border-gold/30 bg-gold/10 text-gold-light"
              : "border-gold/40 bg-gold/10 text-gold-deep"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={100}>
        <h2
          className={`mt-5 text-3xl font-black leading-[1.4] sm:text-4xl ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={200}>
          <p
            className={`mt-4 text-[15px] leading-8 sm:text-base sm:leading-8 ${
              dark ? "text-white/60" : "text-ink/60"
            }`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
