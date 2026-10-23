import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { Link } from "../lib/router";
import { toFaDigits } from "../lib/format";
import {
  BriefcaseIcon,
  ContractIcon,
  DocCheckIcon,
  FamilyIcon,
  GavelIcon,
  HardHatIcon,
  HomeIcon,
  TreeIcon,
} from "./Icons";
import { PRACTICE_CLAIM_COUNT, PRACTICE_GROUPS } from "../content/practices";
import { servicePath, type ServiceIconKey } from "../content/services";

const ICONS: Record<ServiceIconKey, typeof FamilyIcon> = {
  family: FamilyIcon,
  gavel: GavelIcon,
  home: HomeIcon,
  doc: DocCheckIcon,
  hardhat: HardHatIcon,
  briefcase: BriefcaseIcon,
  tree: TreeIcon,
  contract: ContractIcon,
};

/**
 * نقشۀ انواع دعاوی حقوقی در صفحۀ اصلی
 * ------------------------------------------------------------------
 * مخاطبی که نام دقیق دعوای خود را نمی‌داند، اینجا موضوع را پیدا می‌کند و از
 * همان‌جا به صفحۀ خدمت یا مقالۀ توضیحی می‌رسد. هیچ ادعای آماری یا تضمین
 * نتیجه‌ای در این بخش نیست؛ فقط دسته‌بندی موضوعی و مسیر مطالعه.
 */
export default function LegalTopics() {
  return (
    <section
      id="legal-topics"
      className="relative scroll-mt-24 overflow-hidden bg-white/70 py-20 lg:py-28"
      aria-labelledby="legal-topics-title"
    >
      <div
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-gold/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-ink/8 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="موضوعات و تخصص‌ها"
          title="انواع دعاوی حقوقی، دسته‌بندی‌شده"
          description="اگر نام دقیق دعوای خود را نمی‌دانید، از موضوع شروع کنید. هر گروه به صفحۀ تخصصی همان حوزه و به راهنمای مرتبط وصل است."
          titleId="legal-topics-title"
        />

        <p className="mt-5 text-[13px] font-semibold text-ink/55">
          {toFaDigits(String(PRACTICE_GROUPS.length))} گروه تخصصی · بیش از{" "}
          {toFaDigits(String(PRACTICE_CLAIM_COUNT))} عنوان دعوا
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:mt-14">
          {PRACTICE_GROUPS.map((group, index) => {
            const Icon = ICONS[group.icon];
            return (
              <Reveal key={group.id} delay={(index % 2) * 100}>
                <article
                  id={`topic-${group.id}`}
                  className="group flex h-full flex-col rounded-3xl border border-ink/8 bg-cream/70 p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:bg-white/85 hover:shadow-deep sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/15 to-gold/5 text-gold-deep transition-all duration-500 group-hover:from-gold group-hover:to-gold-deep group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-extrabold text-ink sm:text-[17px]">
                        <Link to={servicePath(group.service)} className="hover:text-gold-deep">
                          {group.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-[13px] leading-7 text-ink/65">{group.summary}</p>
                    </div>
                  </div>

                  <ul className="mt-5 flex flex-1 flex-wrap content-start gap-2" aria-label={`دعاوی ${group.title}`}>
                    {group.claims.map((claim) =>
                      claim.article ? (
                        <li key={claim.title}>
                          <Link
                            to={`/articles/${claim.article}`}
                            className="inline-flex rounded-full border border-gold/30 bg-gold/8 px-3 py-1 text-[11.5px] font-bold text-gold-deep transition-colors hover:border-gold hover:bg-gold/15"
                          >
                            {claim.title}
                          </Link>
                        </li>
                      ) : (
                        <li
                          key={claim.title}
                          className="inline-flex rounded-full border border-ink/10 bg-white/60 px-3 py-1 text-[11.5px] font-semibold text-ink/70"
                        >
                          {claim.title}
                        </li>
                      )
                    )}
                  </ul>

                  <Link
                    to={servicePath(group.service)}
                    className="mt-6 inline-flex items-center gap-2 text-[12.5px] font-extrabold text-gold-deep transition-all duration-300 hover:gap-3.5 hover:text-ink"
                  >
                    مسیر این پرونده‌ها
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

        <Reveal delay={150}>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white/60 px-6 py-6 sm:flex-row sm:px-8">
            <p className="text-center text-[13.5px] leading-7 text-ink/70 sm:text-right">
              موضوع شما در این فهرست نیست؟ در فرم مشاوره «سایر موضوعات» را انتخاب کنید؛
              مسیر درست در جلسۀ نخست روشن می‌شود.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="rounded-full bg-gold px-5 py-2.5 text-[12.5px] font-extrabold text-ink transition-colors hover:bg-gold-deep hover:text-white"
              >
                درخواست مشاوره
              </Link>
              <Link
                to="/services"
                className="rounded-full border border-ink/15 px-5 py-2.5 text-[12.5px] font-extrabold text-ink transition-colors hover:border-gold hover:text-gold-deep"
              >
                همۀ حوزه‌ها
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
