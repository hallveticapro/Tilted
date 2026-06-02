import { useEffect, useRef } from "react";

interface AboutModalProps {
  onClose: () => void;
}

const socialLinks = [
  {
    name: "GitHub",
    handle: "hallveticapro/Tilted",
    href: "https://github.com/hallveticapro/Tilted",
    icon: "./assets/social-github.svg",
  },
  {
    name: "Threads",
    handle: "@hallveticapro",
    href: "https://www.threads.net/@hallveticapro",
    icon: "./assets/social-threads.svg",
  },
  {
    name: "Instagram",
    handle: "@hallveticapro",
    href: "https://www.instagram.com/hallveticapro",
    icon: "./assets/social-instagram.svg",
  },
  {
    name: "TikTok",
    handle: "@hallveticapro",
    href: "https://www.tiktok.com/@hallveticapro",
    icon: "./assets/social-tiktok.svg",
  },
];

export function AboutModal({ onClose }: AboutModalProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-tilted-title"
        aria-describedby="about-tilted-description"
      >
        <button ref={closeRef} className="modal-close" type="button" aria-label="Close About Tilted" onClick={onClose}>
          ×
        </button>
        <img className="about-modal__logo" src="./assets/tilted-logo.png" alt="Tilted" />
        <div className="about-modal__content">
          <div>
            <p className="eyebrow">About the game</p>
            <h2 id="about-tilted-title">About Tilted</h2>
            <p id="about-tilted-description">
              Tilted is a quick, mobile-friendly team guessing game built for classrooms,
              parties, and any group that wants an easy round of clue-giving fun.
            </p>
            <p>
              It was created to give educators a simple review game that works from a phone,
              includes classroom-friendly decks, and still makes it easy to build custom
              categories for the next lesson.
            </p>
          </div>

          <section className="about-modal__support" aria-labelledby="support-title">
            <h3 id="support-title">Enjoying Tilted?</h3>
            <p>Support server costs and classroom-friendly updates.</p>
            <a
              className="button button--primary"
              href="https://buymeacoffee.com/hallveticapro"
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy Me A Coffee
            </a>
          </section>

          <section aria-labelledby="social-title">
            <h3 id="social-title">Follow Me On Social Media</h3>
            <div className="social-links">
              {socialLinks.map((socialLink) => (
                <a
                  className="social-link"
                  href={socialLink.href}
                  key={socialLink.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={socialLink.icon} alt="" aria-hidden="true" />
                  <span>
                    <strong>{socialLink.name}</strong>
                    <small>{socialLink.handle}</small>
                  </span>
                </a>
              ))}
            </div>
          </section>

          <footer className="about-modal__footer">
            <p>Tilted is an unofficial fan-made game and is not affiliated with featured brands.</p>
            <p>Made for educators with love by Andrew Hall</p>
            <p>© 2026 Tilted</p>
          </footer>
        </div>
      </section>
    </div>
  );
}
