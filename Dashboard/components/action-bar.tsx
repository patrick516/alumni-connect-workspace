"use client";

import { useState } from "react";
import {
  CalendarRange,
  Check,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AnalyticsOverview } from "@/lib/api";

const COHORTS = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
const GENDERS = [
  { value: "all", label: "All Genders" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

interface ActionBarProps {
  years: string[];
  gender: string;
  onYearsChange: (years: string[]) => void;
  onGenderChange: (gender: string) => void;
  data: AnalyticsOverview | null;
}

export function ActionBar({
  years,
  gender,
  onYearsChange,
  onGenderChange,
  data,
}: ActionBarProps) {
  const toggleYear = (year: string) => {
    const next = years.includes(year)
      ? years.filter((y) => y !== year)
      : [...years, year].sort();
    onYearsChange(next);
  };

  const yearLabel =
    years.length === 0
      ? "No years selected"
      : years.length === COHORTS.length
        ? "All Cohorts (2020–2026)"
        : years.length <= 2
          ? years.join(", ")
          : `${years.length} cohorts selected`;

  const genderLabel =
    GENDERS.find((g) => g.value === gender)?.label ?? "All Genders";

  return (
    <div className="border-b border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Filters
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Year selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-[var(--royal)]/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <CalendarRange className="h-4 w-4 text-[var(--royal)]" />
                <span className="max-w-[180px] truncate">{yearLabel}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Select Graduation Year(s)
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {COHORTS.map((year) => (
                    <DropdownMenuCheckboxItem
                      key={year}
                      checked={years.includes(year)}
                      onCheckedChange={() => toggleYear(year)}
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer"
                    >
                      Class of {year}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Gender filter */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-[var(--royal)]/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Users className="h-4 w-4 text-[var(--royal)]" />
                <span>{genderLabel}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuRadioGroup
                  value={gender}
                  onValueChange={onGenderChange}
                >
                  <DropdownMenuLabel>Filter by Gender</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {GENDERS.map((g) => (
                    <DropdownMenuRadioItem
                      key={g.value}
                      value={g.value}
                      className="cursor-pointer"
                    >
                      {g.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Export actions */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:inline">
            Export
          </span>
          <ExportPdfButton data={data} years={years} gender={genderLabel} />
          <ExportExcelButton data={data} years={years} gender={genderLabel} />
        </div>
      </div>
    </div>
  );
}

function ExportPdfButton({
  data,
  years,
  gender,
}: {
  data: AnalyticsOverview | null;
  years: string[];
  gender: string;
}) {
  const [done, setDone] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Exploits University — Alumni Success & Analytics", 14, 18);
      doc.setFontSize(10);
      doc.text(
        `Cohorts: ${years.join(", ") || "None"}  |  Gender: ${gender}`,
        14,
        26,
      );

      doc.setFontSize(12);
      doc.text(
        `Employment Rate: ${data.employmentRate}% (based on ${data.totalReported} reported)`,
        14,
        36,
      );

      autoTable(doc, {
        startY: 44,
        head: [["Gender", "Share (%)", "Employment Rate (%)"]],
        body: data.genderDistribution.map((g) => [
          g.label,
          `${g.value}%`,
          `${g.employmentRate}%`,
        ]),
      });

      const afterGenderY = (doc as any).lastAutoTable?.finalY ?? 60;
      autoTable(doc, {
        startY: afterGenderY + 10,
        head: [["Department / Sector", "Share (%)"]],
        body: data.departmentDistribution.map((d) => [d.sector, `${d.value}%`]),
      });

      const afterDeptY = (doc as any).lastAutoTable?.finalY ?? 100;
      autoTable(doc, {
        startY: afterDeptY + 10,
        head: [["Graduation Cohort", "Employment Rate (%)"]],
        body: data.cohortTrends.map((c) => [c.cohort, `${c.employment}%`]),
      });

      doc.save("alumni-analytics.pdf");
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!data || exporting}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        "border-[var(--crimson)]/40 text-[var(--crimson)] hover:border-[var(--crimson)] hover:bg-[var(--crimson)]/10",
      )}
    >
      {done ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      <span className="hidden sm:inline">
        {exporting ? "Preparing…" : done ? "Downloaded" : "Export PDF"}
      </span>
    </button>
  );
}

function ExportExcelButton({
  data,
  years,
  gender,
}: {
  data: AnalyticsOverview | null;
  years: string[];
  gender: string;
}) {
  const [done, setDone] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const XLSX = await import("xlsx");

      const summarySheet = XLSX.utils.json_to_sheet([
        {
          Cohorts: years.join(", ") || "None",
          Gender: gender,
          "Employment Rate (%)": data.employmentRate,
          "Total Reported": data.totalReported,
        },
      ]);

      const genderSheet = XLSX.utils.json_to_sheet(
        data.genderDistribution.map((g) => ({
          Gender: g.label,
          "Share (%)": g.value,
          "Employment Rate (%)": g.employmentRate,
        })),
      );

      const deptSheet = XLSX.utils.json_to_sheet(
        data.departmentDistribution.map((d) => ({
          "Department / Sector": d.sector,
          "Share (%)": d.value,
        })),
      );

      const cohortSheet = XLSX.utils.json_to_sheet(
        data.cohortTrends.map((c) => ({
          "Graduation Cohort": c.cohort,
          "Employment Rate (%)": c.employment,
        })),
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
      XLSX.utils.book_append_sheet(
        workbook,
        genderSheet,
        "Gender Distribution",
      );
      XLSX.utils.book_append_sheet(
        workbook,
        deptSheet,
        "Sectors & Departments",
      );
      XLSX.utils.book_append_sheet(workbook, cohortSheet, "Cohort Trends");

      XLSX.writeFile(workbook, "alumni-analytics.xlsx");
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!data || exporting}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        "border-[#3f9d54]/40 text-[#2f8f45] hover:border-[#3f9d54] hover:bg-[#3f9d54]/10 dark:text-[#5fc065]",
      )}
    >
      {done ? (
        <Check className="h-4 w-4" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {exporting ? "Preparing…" : done ? "Downloaded" : "Export Excel"}
      </span>
    </button>
  );
}
