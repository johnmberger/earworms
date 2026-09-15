import Link from "next/link";
import { ReactNode } from "react";
import EarwormLogo from "@/components/layout/EarwormLogo";
import BuiltBy from "@/components/layout/BuiltBy";
import MobileNav, { type NavItem } from "@/components/layout/MobileNav";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@/components/shared/icons";

const DOT_BG =
  "bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]";

type PageShellProps = {
  children: ReactNode;
  /** Extra under the brand row (titles, duration control, live badge, …) */
  header?: ReactNode;
  footer?: ReactNode;
  nav?: NavItem[];
  /** When true, brand is a link home; when false, plain wordmark (home page) */
  brandLinksHome?: boolean;
  /** Content max width */
  width?: "wide" | "narrow";
  /** Third decorative orb (home only historically) */
  showCenterOrb?: boolean;
};

function Brand({ asLink }: { asLink: boolean }) {
  const mark = (
    <>
      <span className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-none bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
        earworms
      </span>
      <EarwormLogo size="md" crawling={false} className="shrink-0" />
    </>
  );

  if (asLink) {
    return (
      <Link
        href="/"
        className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity max-w-full min-w-0"
      >
        {mark}
      </Link>
    );
  }

  return (
    <h1 className="flex items-center gap-2 sm:gap-3 min-w-0">{mark}</h1>
  );
}

function NavLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      className="inline-flex items-center gap-1.5 text-dark-300 hover:text-pink-300 transition-colors group"
    >
      {item.back ? (
        <IconChevronLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
      ) : null}
      {item.label}
      {!item.back ? (
        <IconChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      ) : null}
    </Link>
  );
}

function DesktopNav({ items }: { items: NavItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="hidden md:flex items-center gap-4 shrink-0 mt-2 lg:mt-3 text-sm">
      {items.map((item) => (
        <NavLink key={item.href + item.label} item={item} />
      ))}
    </nav>
  );
}

export default function PageShell({
  children,
  header,
  footer,
  nav = [],
  brandLinksHome = true,
  width = "narrow",
  showCenterOrb = false,
}: PageShellProps) {
  // Same horizontal chrome on every page so the brand/nav don't jump between routes.
  // `wide` (home) only adds clearance for the fixed now-playing bar.
  const contentWidth =
    width === "wide"
      ? "mx-auto w-full max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12 lg:pt-14 pb-[calc(8.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(9.5rem+env(safe-area-inset-bottom))]"
      : "mx-auto w-full max-w-6xl px-4 sm:px-6 pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      <div className={`absolute inset-0 ${DOT_BG} opacity-40`} />
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/25 via-pink-500/20 to-red-500/25 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      {showCenterOrb ? (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-purple-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      ) : null}

      <main className="relative z-10">
        <div className={contentWidth}>
          <header className="mb-10 sm:mb-12">
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-6 min-h-11">
              <div className="min-w-0">
                <Brand asLink={brandLinksHome} />
              </div>
              <DesktopNav items={nav} />
              <MobileNav items={nav} />
            </div>
            {header}
          </header>

          {children}

          {footer ? (
            <footer className="mt-20 sm:mt-24 lg:mt-32 pt-10 border-t border-white/10">
              {footer}
            </footer>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export function PageFooterLinks({
  links,
}: {
  links: { href: string; label: string; back?: boolean }[];
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {links.map((link) => (
          <NavLink key={link.href + link.label} item={link} />
        ))}
      </div>
      <BuiltBy className="sm:justify-end" />
    </div>
  );
}
