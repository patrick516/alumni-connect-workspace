export function DashboardFooter() {
  return (
    <footer className="mt-4 border-t border-border/80 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold italic text-[var(--crimson)] sm:text-left">
          * Data-driven decision making and accreditation support.
        </p>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="text-muted-foreground">
          &copy; 2026 Exploits University Alumni Success &amp; Analytics. All
          Rights Reserved.
        </p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4fa254] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4fa254]" />
            </span>
            Malawian Kwacha (MWK) Platform
          </span>
          <a
            href="#admin-login"
            //http://localhost:5173
            className="font-semibold text-[var(--crimson)] underline-offset-4 transition-colors hover:underline"
          >
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
