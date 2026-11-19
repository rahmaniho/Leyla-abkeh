import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/** حالت خالی استاندارد با آیکون و راهنما */
export default function EmptyState({ icon: Icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="empty-panel">
      <div className="empty-icon">
        <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <p style={{ fontWeight: 800, color: "var(--text)", margin: "0 0 4px" }}>{title}</p>
      {hint && <p className="empty" style={{ margin: 0 }}>{hint}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
