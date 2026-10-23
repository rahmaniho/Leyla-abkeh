import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { ARTICLES } from "../src/content/articles";
import { PRACTICE_GROUPS } from "../src/content/practices";

function renderAt(path: string) {
  return render(<App initialPath={path} />);
}

function cardCount(): number {
  return screen.queryAllByTestId("article-card").length;
}

describe("جست‌وجو و فیلتر در صفحۀ مقالات", () => {
  it("همۀ مقاله‌ها در حالت عادی نمایش داده می‌شوند", () => {
    renderAt("/articles");
    expect(cardCount()).toBe(ARTICLES.length);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("جست‌وجو با «ي» عربی هم مقاله‌های مرتبط را پیدا می‌کند", () => {
    renderAt("/articles");
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "مهريه" } });

    const count = cardCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(ARTICLES.length);

    const cards = screen.getAllByTestId("article-card");
    expect(cards.some((card) => within(card).queryAllByText(/مهریه/).length > 0)).toBe(true);
  });

  it("عبارت بی‌نتیجه، پیام راهنما و دکمۀ بازگردانی نشان می‌دهد", () => {
    renderAt("/articles");
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "واژۀ‌بی‌ربط‌آزمایشی" },
    });

    expect(cardCount()).toBe(0);
    expect(screen.getByText(/مقاله‌ای با این عبارت پیدا نشد/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "نمایش همۀ مقاله‌ها" }));
    expect(cardCount()).toBe(ARTICLES.length);
  });

  it("فیلتر گروه دعاوی، فهرست را به همان گروه محدود می‌کند", () => {
    renderAt("/articles");
    const group = PRACTICE_GROUPS.find(
      (item) => item.claims.filter((claim) => claim.article).length > 0
    )!;

    const chip = screen.getByRole("button", { name: new RegExp(group.title) });
    fireEvent.click(chip);

    expect(chip).toHaveAttribute("aria-pressed", "true");
    const count = cardCount();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(ARTICLES.length);
  });

  it("پیام شمارش نتایج برای صفحه‌خوان اعلام می‌شود", () => {
    renderAt("/articles");
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "چک" } });

    const statuses = screen.getAllByRole("status");
    expect(statuses.some((status) => status.textContent?.includes("مقاله"))).toBe(true);
  });
});

describe("صفحۀ مقاله", () => {
  it("فهرست مطالب با پیوند به لنگر هر سرتیتر دارد", () => {
    const article = ARTICLES.find((item) => item.headings.length >= 3)!;
    renderAt(`/articles/${article.slug}`);

    const nav = screen.getByRole("navigation", { name: "در این مقاله" });
    const links = within(nav).getAllByRole("link");

    expect(links.length).toBe(article.headings.length);
    expect(links[0]).toHaveAttribute("href", `#${article.headings[0].id}`);
  });

  it("جعبۀ نویسنده، نام و شمارۀ پروانه را نشان می‌دهد", () => {
    const article = ARTICLES[0];
    renderAt(`/articles/${article.slug}`);

    expect(screen.getByText(/شمارۀ پروانۀ وکالت/)).toBeInTheDocument();
  });

  it("مقاله‌های مرتبط نمایش داده می‌شوند و پیوند به خود مقاله ندارند", () => {
    const article = ARTICLES[0];
    renderAt(`/articles/${article.slug}`);

    const heading = screen.getByRole("heading", { name: "مقاله‌های مرتبط" });
    const section = heading.closest("div")!;
    const links = within(section).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links.map((link) => link.getAttribute("href"))).not.toContain(
      `/articles/${article.slug}/`
    );
  });
});
