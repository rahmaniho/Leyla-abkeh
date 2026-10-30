import { useEffect, useRef } from "react";
import { withBase } from "../lib/base";
import "./DeveloperCredit.css";

/** نشان و نوشته‌ها از لوگوی اصلی کارن‌سافت برش خورده‌اند، نه بازنویسی شده. */
export default function DeveloperCredit() {
  const creditRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const credit = creditRef.current;
    if (!credit) return;
    if (typeof IntersectionObserver === "undefined") {
      credit.classList.add("developer-credit--visible");
      return;
    }

    // حرکت کوتاه است و با ورود امضا به قاب شروع می‌شود، نه پیش از دیده‌شدن آن.
    const observer = new IntersectionObserver(
      (entries) => credit.classList.toggle("developer-credit--visible", entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.3 }
    );
    observer.observe(credit);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      ref={creditRef}
      className="developer-credit"
      href="https://www.karen-soft.ir"
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      aria-label="طراحی و توسعه توسط کارن سافت، KarenSoft (باز شدن در پنجرۀ جدید)"
    >
      <span className="developer-credit__label" lang="en">
        Designed &amp;<br />Developed by
      </span>
      <span className="developer-credit__brand" aria-hidden="true">
        <span className="developer-credit__emblem">
          <img
            src={withBase("/images/karensoft/mark.png")}
            alt=""
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="developer-credit__wordmarks">
          <img
            className="developer-credit__wordmark-fa"
            src={withBase("/images/karensoft/wordmark-fa.png")}
            alt=""
            width={383}
            height={96}
            loading="lazy"
            decoding="async"
          />
          <img
            className="developer-credit__wordmark-en"
            src={withBase("/images/karensoft/wordmark-en.png")}
            alt=""
            width={410}
            height={48}
            loading="lazy"
            decoding="async"
          />
        </span>
      </span>
    </a>
  );
}
