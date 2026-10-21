import { Link } from "../lib/router";
import type { BreadcrumbItem } from "../lib/seo";

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="مسیر صفحه" className="text-[12.5px] text-white/55">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="font-semibold text-gold-light">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="transition-colors hover:text-gold-light">
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="text-white/30">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
