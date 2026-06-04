import { useCallback, useEffect, useRef, useState } from "react";

interface CategoryScrollerProps {
  ariaLabel: string;
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
  compact?: boolean;
}

function CategoryArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className="category-scroller__arrow-icon"
      viewBox="0 0 24 24"
      focusable="false"
    >
      {direction === "left" ? (
        <path d="M14.8 5.4 8.4 12l6.4 6.6" />
      ) : (
        <path d="m9.2 5.4 6.4 6.6-6.4 6.6" />
      )}
    </svg>
  );
}

export function CategoryScroller({
  ariaLabel,
  categories,
  selectedCategory,
  onSelect,
  compact = false,
}: CategoryScrollerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    setCanScrollLeft(list.scrollLeft > 1);
    setCanScrollRight(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [categories, updateScrollState]);

  const scroll = (direction: -1 | 1) => {
    listRef.current?.scrollBy({
      left: direction * Math.max(180, listRef.current.clientWidth * 0.7),
      behavior: "smooth",
    });
  };

  return (
    <nav
      className={`category-scroller ${compact ? "category-scroller--compact" : ""}`}
      aria-label={ariaLabel}
    >
      <button
        className="category-scroller__arrow category-scroller__arrow--left"
        type="button"
        aria-label="Scroll Categories Left"
        disabled={!canScrollLeft}
        onClick={() => scroll(-1)}
      >
        <CategoryArrowIcon direction="left" />
      </button>
      <div className="category-scroller__list" ref={listRef} onScroll={updateScrollState}>
        {categories.map((category) => (
          <button
            className={selectedCategory === category ? "is-selected" : ""}
            key={category}
            type="button"
            aria-pressed={selectedCategory === category}
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <button
        className="category-scroller__arrow category-scroller__arrow--right"
        type="button"
        aria-label="Scroll Categories Right"
        disabled={!canScrollRight}
        onClick={() => scroll(1)}
      >
        <CategoryArrowIcon direction="right" />
      </button>
    </nav>
  );
}
