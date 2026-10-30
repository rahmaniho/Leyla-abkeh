import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { PRACTICE_CLAIM_COUNT, PRACTICE_GROUPS } from "../src/content/practices";
import { render as renderServer } from "../src/entry-server";

function topics() {
  return screen.getByRole("region", { name: "انواع دعاوی حقوقی، دسته‌بندی‌شده" });
}

describe("جست‌وجوی نقشۀ دعاوی", () => {
  it("همۀ گروه‌ها و عنوان‌ها در HTML اولیه و بدون جست‌وجو وجود دارند", () => {
    const server = document.createElement("div");
    server.innerHTML = renderServer("/").html;
    for (const group of PRACTICE_GROUPS) {
      const card = server.querySelector(`#topic-${group.id}`);
      expect(card, group.title).not.toBeNull();
      for (const claim of group.claims) expect(card?.textContent).toContain(claim.title);
    }
    render(<App initialPath="/" />);
    expect(within(topics()).getByRole("status")).toHaveTextContent(String(PRACTICE_CLAIM_COUNT).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]));
  });

  it("حروف عربی را نرمال می‌کند و به مقالۀ مرتبط پیوند می‌دهد", () => {
    render(<App initialPath="/" />);
    fireEvent.change(within(topics()).getByRole("searchbox"), { target: { value: "مهريه" } });
    expect(within(topics()).getByRole("link", { name: "مطالبۀ مهریه" })).toHaveAttribute("href", "/articles/mehrieh-motalebe-va-ijra/");
    expect(within(topics()).queryByText("طلاق توافقی")).toBeNull();
    expect(within(topics()).getByRole("status")).toHaveTextContent("عنوان در");
  });

  it("گروه و جست‌وجو را ترکیب می‌کند و حالت بی‌نتیجه قابل بازگردانی است", () => {
    render(<App initialPath="/" />);
    const area = within(topics());
    fireEvent.change(area.getByLabelText("گروه موضوعی"), { target: { value: "keyfari" } });
    expect(area.getByRole("heading", { name: "دعاوی کیفری" })).toBeInTheDocument();
    expect(area.queryByRole("heading", { name: "دعاوی خانواده" })).toBeNull();
    fireEvent.change(area.getByRole("searchbox"), { target: { value: "عبارت ناموجود" } });
    expect(area.getByText(/موضوعی با این عبارت پیدا نشد/)).toBeInTheDocument();
    fireEvent.click(area.getByRole("button", { name: "نمایش همۀ موضوعات" }));
    expect(area.getByRole("heading", { name: "دعاوی خانواده" })).toBeInTheDocument();
    expect(area.getByRole("searchbox")).toHaveValue("");
  });
});
