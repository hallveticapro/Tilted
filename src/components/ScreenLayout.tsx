import type { PropsWithChildren, ReactNode } from "react";

interface ScreenLayoutProps extends PropsWithChildren {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  compact?: boolean;
}

export function ScreenLayout({
  title,
  eyebrow,
  actions,
  compact = false,
  children,
}: ScreenLayoutProps) {
  return (
    <main className={`screen ${compact ? "screen--compact" : ""}`}>
      <header className="screen__header">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
        </div>
        {actions && <div className="screen__header-actions">{actions}</div>}
      </header>
      {children}
    </main>
  );
}
