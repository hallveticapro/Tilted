import type { PropsWithChildren, ReactNode } from "react";

interface ScreenLayoutProps extends PropsWithChildren {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  compact?: boolean;
}

function TiltedWordmark() {
  return (
    <span className="tilted-wordmark" aria-label="Tilted">
      {"Tilted".split("").map((letter, index) => (
        <span aria-hidden="true" key={`${letter}-${index}`}>
          {letter}
        </span>
      ))}
    </span>
  );
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
          <h1>{title === "Tilted" ? <TiltedWordmark /> : title}</h1>
        </div>
        {actions && <div className="screen__header-actions">{actions}</div>}
      </header>
      {children}
    </main>
  );
}
