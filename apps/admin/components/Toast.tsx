"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export interface ToastItem {
  id: number;
  message: string;
}

/** هوک مدیریت توست‌ها (خودکار پس از ۳٫۵ ثانیه محو می‌شود) */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string) => {
    counter.current += 1;
    const id = counter.current;
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return { toasts, push };
}

/** پشتهٔ توست (همواره در گوشهٔ پایین — بدون پوشش محتوا) */
export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <CheckCircle2 size={17} strokeWidth={2} aria-hidden="true" />
          {toast.message}
        </div>
      ))}
    </div>
  );
}
