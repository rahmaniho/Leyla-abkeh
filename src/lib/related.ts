import { ARTICLE_GROUP_ID } from "../content/practices";
import type { Article } from "../content/articles";

/**
 * مقاله‌های مرتبط — بدون فهرست دستی
 * ------------------------------------------------------------------
 * هر مقاله در نقشۀ دعاوی به یک گروه تعلق دارد؛ همان گروه، نخستین
 * معیار ارتباط است. پس از آن، خدمت مرتبط و برچسب‌های مشترک وزن
 * می‌گیرند. نتیجه قطعی و پایدار است تا HTML پیش‌رندر و رندر مرورگر
 * یکسان بمانند.
 */
export function relatedArticles(article: Article, all: Article[], limit = 3): Article[] {
  const group = ARTICLE_GROUP_ID.get(article.slug);

  const scored = all
    .filter((item) => item.slug !== article.slug)
    .map((item) => {
      let score = 0;
      /* هم‌گروه‌بودن، تعیین‌کننده‌ترین معیار است */
      if (group && ARTICLE_GROUP_ID.get(item.slug) === group) score += 10;
      score += item.relatedServices.filter((service) =>
        article.relatedServices.includes(service)
      ).length;
      score += item.tags.filter((tag) => article.tags.includes(tag)).length * 3;
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.publishDate < b.item.publishDate ? 1 : -1;
    });

  return scored.slice(0, limit).map((entry) => entry.item);
}

/** مقالۀ قبلی و بعدی بر پایۀ ترتیب انتشار (تازه‌ترین اول) */
export function adjacentArticles(
  article: Article,
  all: Article[]
): { newer: Article | null; older: Article | null } {
  const index = all.findIndex((item) => item.slug === article.slug);
  if (index === -1) return { newer: null, older: null };
  return {
    newer: index > 0 ? all[index - 1] : null,
    older: index < all.length - 1 ? all[index + 1] : null,
  };
}
