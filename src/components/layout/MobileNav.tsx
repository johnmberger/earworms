import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { IconChevronRight, IconMenuToggle } from "@/components/shared/icons";

export type NavItem = {
  href: string;
  label: string;
  /** Arrow before label (desktop / footer only) */
  back?: boolean;
};

/** Mobile header menu — ≥44px targets for comfortable touch. */
export default function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="relative md:hidden shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label={open ? "close menu" : "open menu"}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center justify-center min-h-11 min-w-11 -mr-1 rounded-xl border transition-all duration-200 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 ${
          open
            ? "border-pink-400/35 bg-white/10 text-pink-300 shadow-[inset_0_0_0_1px_rgba(244,114,182,0.12)]"
            : "border-white/15 bg-white/[0.06] text-dark-200 hover:border-pink-400/30 hover:bg-white/10 hover:text-pink-300 active:bg-white/[0.12] active:scale-[0.97]"
        }`}
      >
        <IconMenuToggle open={open} className="w-5 h-5" />
      </button>

      {open ? (
        <nav
          id={menuId}
          aria-label="site"
          className="absolute right-0 top-full mt-1.5 min-w-[12.5rem] rounded-xl border border-white/10 bg-slate-950/95 py-1.5 shadow-xl shadow-black/40 backdrop-blur-md z-30"
        >
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="group flex items-center gap-2 min-h-11 px-4 text-base text-dark-200 hover:text-pink-300 hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation focus-visible:outline-none focus-visible:bg-white/5 focus-visible:text-pink-300"
            >
              <span className="flex-1">{item.label}</span>
              <IconChevronRight className="w-4 h-4 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
