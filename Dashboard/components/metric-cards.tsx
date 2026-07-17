"use client";

import { Briefcase, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AnalyticsOverview } from "@/lib/api";

interface MetricCardsProps {
  data: AnalyticsOverview | null;
  loading: boolean;
}

export function MetricCards({ data, loading }: MetricCardsProps) {
  const employmentRate = data?.employmentRate ?? null;

  return (
    <section
      aria-label="Key alumni metrics"
      className="grid gap-4 md:grid-cols-1 lg:gap-6"
    >
      <Card className="group relative overflow-hidden border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[var(--gold)]/40 hover:shadow-md lg:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--royal)] via-[var(--crimson)] to-[var(--gold)] opacity-80"
        />

        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Employment Rate
          </p>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/70 text-[var(--royal)] ring-1 ring-border transition-colors group-hover:bg-muted dark:text-[var(--gold)]">
            <Briefcase className="h-4.5 w-4.5" />
          </span>
        </div>

        <p className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          {loading
            ? "—"
            : employmentRate !== null
              ? `${employmentRate}%`
              : "N/A"}
        </p>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Percentage of surveyed graduates reporting full-time employment,
          freelance consulting, or entrepreneurship.
        </p>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: "var(--crimson)",
                boxShadow:
                  "0 0 0 3px color-mix(in oklab, var(--crimson) 20%, transparent)",
              }}
            />
            Active status
          </span>

          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-[#4fa254]/12 text-[#3a8a3f] ring-1 ring-[#4fa254]/25 dark:bg-[#5fc065]/15 dark:text-[#7fd884]">
            <TrendingUp className="h-3 w-3" />
            Live data
          </span>
        </div>
      </Card>
    </section>
  );
}
