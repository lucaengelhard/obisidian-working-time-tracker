"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Timer } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "./ui/scroll-area";

export function DateTimePicker({
  onDateChange,
}: {
  onDateChange: (date?: Date) => void;
}) {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            " justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPpp") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(e) => {
            setDate(e);
            onDateChange(e);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function TimePicker({
  onTimeChange,
}: {
  onTimeChange: (time: { h: number; m: number }) => void;
}) {
  const [hour, setHour] = React.useState<number>();
  const [minute, setMinute] = React.useState<number>(0);

  const hours = [...Array(24).keys()];
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          {hour === undefined ? (
            <Timer />
          ) : (
            `${String(hour).padStart(2, "0")}:${String(minute).padStart(
              2,
              "0"
            )}`
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto flex gap-5">
        <ScrollArea className="h-40 w-10">
          <div>
            {hours.map((h) => (
              <div
                className={cn(
                  "cursor-pointer p-2 rounded text-center hover:bg-gray-200",
                  h === hour ? "bg-gray-950 text-white" : ""
                )}
                onClick={() => {
                  setHour(h);
                  onTimeChange({ h, m: minute });
                }}
              >
                {h}
              </div>
            ))}
          </div>
        </ScrollArea>
        <ScrollArea className="h-40 w-10">
          <div>
            {minutes.map((m) => (
              <div
                className={cn(
                  "cursor-pointer p-2 rounded text-center hover:bg-gray-200",
                  m === minute ? "bg-gray-950 text-white" : ""
                )}
                onClick={() => {
                  setMinute(m);
                  if (hour === undefined) setHour(0);
                  onTimeChange({ h: hour ?? 0, m });
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
