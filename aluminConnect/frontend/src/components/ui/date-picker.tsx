import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DatePickerProps {
  value: string; // "yyyy-MM-dd" or "yyyy-MM-ddTHH:mm" (matches native input value formats)
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  includeTime?: boolean;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const toLocalDateTimeString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;

const toLocalDateString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDisplay = (date: Date, includeTime: boolean) => {
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!includeTime) return datePart;
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} at ${timePart}`;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  includeTime = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dateValue = value ? new Date(value) : undefined;
  const timeValue =
    includeTime && dateValue
      ? `${pad(dateValue.getHours())}:${pad(dateValue.getMinutes())}`
      : "09:00";

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    if (includeTime) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      date.setHours(hours, minutes);
      onChange(toLocalDateTimeString(date));
    } else {
      onChange(toLocalDateString(date));
      setOpen(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const base = dateValue || new Date();
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const updated = new Date(base);
    updated.setHours(hours, minutes);
    onChange(toLocalDateTimeString(updated));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#1e3a6e]" />
          {dateValue ? formatDisplay(dateValue, includeTime) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          autoFocus
        />
        {includeTime && (
          <div className="border-t border-gray-100 p-3 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Time</span>
            <Select
              value={timeValue.split(":")[0]}
              onValueChange={(hour) => {
                const minute = timeValue.split(":")[1];
                handleTimeChange({
                  target: { value: `${hour}:${minute}` },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <SelectTrigger className="w-[70px] border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => pad(i)).map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-gray-400">:</span>
            <Select
              value={timeValue.split(":")[1]}
              onValueChange={(minute) => {
                const hour = timeValue.split(":")[0];
                handleTimeChange({
                  target: { value: `${hour}:${minute}` },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <SelectTrigger className="w-[70px] border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["00", "15", "30", "45"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              className="ml-auto bg-[#1e3a6e] hover:bg-[#162d57]"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
