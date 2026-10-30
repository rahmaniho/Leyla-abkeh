import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FloatingCall from "../src/components/FloatingCall";
import { primaryPhone } from "../src/config/site";
import { RouterProvider } from "../src/lib/router";

describe("دکمۀ تماس شناور", () => {
  it("هنگام دیدن فرم پنهان می‌شود و پس از خروج دوباره در دسترس است", () => {
    render(
      <RouterProvider initialPath="/">
        <form aria-label="فرم درخواست مشاوره" />
        <FloatingCall />
      </RouterProvider>
    );
    expect(screen.getByRole("link", { name: primaryPhone!.ariaLabel })).toBeInTheDocument();
    const intersect = (globalThis as unknown as { __intersect: (visible: boolean) => void }).__intersect;
    act(() => intersect(true));
    expect(screen.queryByRole("link", { name: primaryPhone!.ariaLabel })).toBeNull();
    act(() => intersect(false));
    expect(screen.getByRole("link", { name: primaryPhone!.ariaLabel })).toBeInTheDocument();
  });
});
