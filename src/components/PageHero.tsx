import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import type { BreadcrumbItem } from "../lib/seo";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
}

/** سربرگ تیرۀ صفحات داخلی — هم‌خوان با هویت بصری سرمه‌ای/طلایی */
export default function PageHero({ eyebrow, title, description, breadcrumbs, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink pt-28 pb-14 lg:pt-36 lg:pb-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_20%,black,transparent)]" />
        <div className="animate-drift absolute -top-28 right-[10%] h-80 w-80 rounded-full bg-gold/20 blur-[120px]" />
        <div className="animate-drift-slow absolute -bottom-32 left-[6%] h-80 w-80 rounded-full bg-ink-mist/50 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[12.5px] font-bold text-gold-light backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            {eyebrow}
          </span>
        )}

        <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.4] text-white sm:text-4xl lg:text-[2.9rem] lg:leading-[1.35]">
          {title}
        </h1>

        {description && (
          <p className="mt-5 max-w-2xl text-[15px] leading-8 text-white/65 sm:text-base">
            {description}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
