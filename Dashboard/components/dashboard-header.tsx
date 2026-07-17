import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:py-4 lg:px-8">
        {/* Left: logo + titles */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--gold)]/40 bg-card shadow-sm sm:h-14 sm:w-14">
            <Image
              src="/exploits-logo.jpeg"
              alt="Exploits University crest logo"
              fill
              sizes="56px"
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Exploits University
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--crimson)] sm:text-xs">
              Alumni Success &amp; Analytics Portal
            </span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--royal)] to-[#1c1a5c] text-sm font-semibold text-white ring-2 ring-[var(--gold)]/40"
            aria-label="Signed in as registrar"
            title="Registrar Account"
          >
            RG
          </div>

          <a
            href={process.env.NEXT_PUBLIC_ALUMNI_CONNECT_URL}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e31b23] to-[#b3141b] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#e31b23]/25 transition-all hover:shadow-xl hover:shadow-[#e31b23]/35 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crimson)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="hidden sm:inline">Admin Dashboard</span>
            <span className="sm:hidden">Admin</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
