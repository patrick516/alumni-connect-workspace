"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AnalyticsOverview } from "@/lib/api";

const config = {
  employment: {
    label: "Employment Rate (%)",
    color: "var(--viz-2)",
  },
};

interface TrendsChartProps {
  data: AnalyticsOverview | null;
  loading: boolean;
}

export function TrendsChart({ data, loading }: TrendsChartProps) {
  const chartData = data?.cohortTrends ?? [];

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="gap-1">
        <CardTitle className="font-serif text-lg font-bold tracking-tight">
          Employment Trends
        </CardTitle>
        <CardDescription className="text-sm">
          Employment rate across graduation cohorts (2020&ndash;2026).
        </CardDescription>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2.5 w-6 rounded-full bg-[var(--viz-2)]" />
            Employment Rate (%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No cohort data available yet for 2020&ndash;2026.
          </p>
        ) : (
          <ChartContainer config={config} className="h-[340px] w-full">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="cohort"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const label =
                        config[name as keyof typeof config]?.label ?? name;
                      return (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold text-foreground">
                            {value}%
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="employment"
                stroke="var(--viz-2)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--viz-2)", strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "var(--background)",
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
