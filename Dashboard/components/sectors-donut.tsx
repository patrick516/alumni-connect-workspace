"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
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

const palette = [
  "var(--viz-1)",
  "var(--viz-2)",
  "var(--viz-3)",
  "var(--viz-4)",
  "var(--viz-5)",
  "var(--viz-6)",
  "var(--viz-7)",
  "var(--viz-8)",
];

interface SectorsDonutProps {
  data: AnalyticsOverview | null;
  loading: boolean;
}

export function SectorsDonut({ data, loading }: SectorsDonutProps) {
  const sectors = (data?.departmentDistribution ?? []).map((d, i) => ({
    sector: d.sector,
    value: d.value,
    color: palette[i % palette.length],
  }));

  const config = Object.fromEntries(
    sectors.map((s) => [s.sector, { label: s.sector, color: s.color }]),
  );

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="gap-1">
        <CardTitle className="font-serif text-lg font-bold tracking-tight">
          Top Sectors &amp; Industries
        </CardTitle>
        <CardDescription className="text-sm">
          Distribution of alumni by academic department.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : sectors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data available yet.
          </p>
        ) : (
          <>
            <ChartContainer
              config={config}
              className="mx-auto aspect-square h-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-semibold text-foreground">
                            {value}%
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={sectors}
                  dataKey="value"
                  nameKey="sector"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {sectors.map((s) => (
                    <Cell key={s.sector} fill={s.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) - 6}
                              className="fill-foreground font-serif text-2xl font-bold"
                            >
                              {sectors.length}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 14}
                              className="fill-muted-foreground text-[11px]"
                            >
                              Sectors
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex-1">
              {sectors.map((s) => (
                <li
                  key={s.sector}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="truncate text-muted-foreground">
                      {s.sector}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {s.value}%
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
