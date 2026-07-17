"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsOverview } from "@/lib/api";

const colorMap: Record<string, string> = {
  male: "var(--viz-1)",
  female: "var(--viz-2)",
  other: "var(--viz-3)",
};

interface GenderDistributionProps {
  data: AnalyticsOverview | null;
  loading: boolean;
}

export function GenderDistribution({ data, loading }: GenderDistributionProps) {
  const rows = (data?.genderDistribution ?? []).map((g) => ({
    label: g.label.charAt(0).toUpperCase() + g.label.slice(1),
    value: g.value,
    employment: `${g.employmentRate}%`,
    color: colorMap[g.label] ?? "var(--viz-3)",
  }));

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="gap-1">
        <CardTitle className="font-serif text-lg font-bold tracking-tight">
          Gender Distribution Analysis
        </CardTitle>
        <CardDescription className="text-sm">
          Surveyed alumni composition with corresponding employment outcomes by
          gender.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data available yet.
          </p>
        ) : (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full ring-1 ring-border">
              {rows.map((g) => (
                <div
                  key={g.label}
                  style={{ width: `${g.value}%`, backgroundColor: g.color }}
                  className="h-full transition-all"
                />
              ))}
            </div>

            <ul className="flex flex-col gap-4">
              {rows.map((g) => (
                <li key={g.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: g.color }}
                      />
                      {g.label}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {g.value}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${g.value}%`, backgroundColor: g.color }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Employment rate&nbsp;
                    <span className="font-semibold text-foreground">
                      {g.employment}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
