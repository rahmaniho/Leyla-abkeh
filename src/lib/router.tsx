import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { normalizePath } from "./seo";

const NAVIGATE_EVENT = "app:navigate";

export interface RouterValue {
  pathname: string;
  hash: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

function readLocation(): { pathname: string; hash: string } {
  if (typeof window === "undefined") return { pathname: "/", hash: "" };
  return {
    pathname: normalizePath(window.location.pathname),
    hash: window.location.hash.replace(/^#/, ""),
  };
}

function splitTarget(to: string): { pathname: string; hash: string } {
  const [rawPath, rawHash = ""] = to.split("#");
  const pathname = rawPath ? normalizePath(rawPath) : normalizePath(readLocation().pathname);
  return { pathname, hash: rawHash };
}

export function RouterProvider({
  initialPath,
  children,
}: {
  initialPath?: string;
  children: ReactNode;
}) {
  const [location, setLocation] = useState(() => {
    if (initialPath) return splitTarget(initialPath);
    return readLocation();
  });

  useEffect(() => {
    const sync = () => setLocation(readLocation());
    window.addEventListener("popstate", sync);
    window.addEventListener(NAVIGATE_EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(NAVIGATE_EVENT, sync);
    };
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === "undefined") return;
    const target = to.startsWith("#") ? to : to;
    if (options?.replace) window.history.replaceState({}, "", target);
    else window.history.pushState({}, "", target);
    window.dispatchEvent(new Event(NAVIGATE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ pathname: location.pathname, hash: location.hash, navigate }),
    [location.pathname, location.hash, navigate]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used inside RouterProvider");
  }
  return context;
}

export function usePathname(): string {
  return useRouter().pathname;
}

/** لینک داخلی با پشتیبانی از کلیک میانی/کنترل و دسترس‌پذیری */
export function Link({
  to,
  children,
  onClick,
  ...rest
}: { to: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { navigate } = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (rest.target && rest.target !== "_self") return;

    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
