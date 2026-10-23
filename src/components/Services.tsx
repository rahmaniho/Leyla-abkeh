import Reveal from "./Reveal";
import { toFaDigits } from "../lib/format";
import SectionHeader from "./SectionHeader";
import {
  BriefcaseIcon,
  DocCheckIcon,
  FamilyIcon,
  GavelIcon,
  HardHatIcon,
  HomeIcon,
} from "./Icons";
import { SERVICES, servicePath, type ServiceIconKey } from "../content/services";
import { Link } from "../lib/router";

const ICONS: Record<ServiceIconKey, typeof FamilyIcon> = {
  family: FamilyIcon,
  gavel: GavelIcon,
  home: HomeIcon,
  doc: DocCheckIcon,
  hardhat: HardHatIcon,
  briefcase: BriefcaseIcon,
};

export default function Services({ limit }: { limit?: number }) {
  const services = typeof limit === "number" ? SERVICES.slice(0, limit) : SERVICES;

  return (
    <section
      id="services"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-cream via-sand to-cream py-20 lg:py-28"
      aria-labelledby="services-title"
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-gold/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-ink/8 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="حوزه‌های فعالیت"
          title="در هر مسیر حقوقی، همراه شما هستم"
          description="از خانواده تا تجارت؛ برای هر مسئلۀ حقوقی، مسیر دقیق، شفاف و قابل اجرا پیشنهاد می‌شود."
          titleId="services-title"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = ICONS[service.icon];
            return (
              <Reveal key={service.slug} delay={(index % 3) * 120}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white/75 p-7 shadow-soft backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/50 hover:shadow-deep">
                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/15 to-gold/5 text-gold-deep transition-all duration-500 group-hover:from-gold group-hover:to-gold-deep group-hover:text-white group-hover:shadow-gold">
                      <Icon className="h-7 w-7" />
                    </span>
                    <span
                      className="text-3xl font-black text-ink/10 transition-colors duration-500 group-hover:text-gold/30"
                      aria-hidden="true"
                    >
                      {toFaDigits(String(index + 1).padStart(2, "0"))}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-extrabold text-ink">
                    <Link to={servicePath(service.slug)} className="hover:text-gold-deep">
                      {service.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 text-[13.5px] leading-7 text-ink/70">{service.summary}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-ink/10 bg-ink/4 px-3 py-1 text-[11.5px] font-semibold text-ink/70 transition-colors duration-300 group-hover:border-gold/35 group-hover:text-gold-deep"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={servicePath(service.slug)}
                    className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-gold-deep transition-all duration-300 hover:gap-3.5 hover:text-ink"
                  >
                    جزئیات این حوزه
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M19 12H5m6-6-6 6 6 6" />
                    </svg>
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-gold hover:text-gold-deep"
            >
              مشاهدۀ همۀ حوزه‌های فعالیت
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
