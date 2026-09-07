import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "../utils/cn";

type Direction = "up" | "down" | "left" | "right" | "scale";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** تأخیر پلکانی به میلی‌ثانیه */
  delay?: number;
  direction?: Direction;
  style?: CSSProperties;
  id?: string;
}

/**
 * نمایش تدریجی هنگام اسکرول با IntersectionObserver.
 * از prefers-reduced-motion نیز به‌طور خودکار پشتیبانی می‌کند (در CSS).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={cn("reveal", visible && "is-visible", className)}
      data-dir={direction}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </div>
  );
}
