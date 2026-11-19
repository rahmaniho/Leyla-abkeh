"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

/** مودال تأیید استاندارد (جایگزین alert/confirm مرورگر) */
export default function ConfirmModal({ open, title, body, confirmLabel = "حذف", onConfirm, onCancel, busy = false }: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation" onClick={onCancel}>
      <div className="modal-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-icon">
          <AlertTriangle size={24} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <h3 id="confirm-title" style={{ margin: "0 0 6px", fontSize: "0.95rem", color: "var(--text)" }}>{title}</h3>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 2 }}>{body}</p>
        <div className="row-actions" style={{ marginTop: 16, justifyContent: "center" }}>
          <button type="button" className="btn danger" onClick={onConfirm} disabled={busy}>
            {busy ? "در حال انجام…" : confirmLabel}
          </button>
          <button type="button" className="btn secondary" ref={cancelRef} onClick={onCancel} disabled={busy}>انصراف</button>
        </div>
      </div>
    </div>
  );
}
