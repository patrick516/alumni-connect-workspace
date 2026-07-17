"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ActionBar } from "@/components/action-bar";
import { MetricCards } from "@/components/metric-cards";
import { TrendsChart } from "@/components/trends-chart";
import { SectorsDonut } from "@/components/sectors-donut";
import { GenderDistribution } from "@/components/gender-distribution";
import { DashboardFooter } from "@/components/dashboard-footer";
import { getAnalyticsOverview, type AnalyticsOverview } from "@/lib/api";

const COHORTS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];

export default function Page() {
  const [years, setYears] = useState<string[]>([...COHORTS]);
  const [gender, setGender] = useState("all");
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalyticsOverview({ cohorts: years, gender })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [years, gender]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[var(--royal)]/20 blur-3xl dark:bg-[var(--royal)]/25" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[var(--crimson)]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[var(--gold)]/10 blur-3xl" />
      </div>

      <DashboardHeader />
      <ActionBar
        years={years}
        gender={gender}
        onYearsChange={setYears}
        onGenderChange={setGender}
        data={data}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance lg:text-3xl">
            Alumni Success &amp; Analytics Overview
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Real-time graduate outcome intelligence &mdash; employment,
            remuneration, and sector placement metrics for the Exploits
            University alumni network.
          </p>
          <p className="mt-1 text-xs font-medium italic text-[var(--crimson)]">
            * Data-driven decision making and accreditation support.
          </p>
        </div>

        <MetricCards data={data} loading={loading} />

        <section
          aria-label="Comparative trends and sector breakdowns"
          className="mt-6 lg:mt-8"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Comparative Trends &amp; Sector Breakdowns
          </h2>
          <div className="grid gap-4 lg:grid-cols-5 lg:gap-6">
            <div className="flex flex-col gap-4 lg:col-span-3 lg:gap-6">
              <TrendsChart data={data} loading={loading} />
              <GenderDistribution data={data} loading={loading} />
            </div>
            <div className="lg:col-span-2">
              <SectorsDonut data={data} loading={loading} />
            </div>
          </div>
        </section>
      </main>

      <DashboardFooter />
    </div>
  );
}
