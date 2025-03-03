"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock10 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTime } from "@/data/store";
import { ScrollArea } from "./ui/scroll-area";
import { ObjTimeToStr } from "@/lib/datetime";

export function DatePicker({
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
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
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
  onTimeChange: (time?: SimpleTime) => void;
}) {
  const [hour, setHour] = React.useState<number>();
  const [minute, setMinute] = React.useState<number>();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 13 }, (_, i) => i * 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {hour === undefined || minute === undefined ? (
            <Clock10 />
          ) : (
            ObjTimeToStr({ hours: hour, minutes: minute })
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex gap-2">
        <ScrollArea className="h-60 p-1">
          {hours.map((h) => (
            <div
              key={h}
              onClick={() => {
                setHour(h);
                onTimeChange({ hours: h, minutes: minute ?? 0 });
                if (minute == undefined) setMinute(0);
              }}
              className={cn(
                "text-center p-2 cursor-pointer select-none text-black hover:bg-gray-100",
                h === hour && "bg-gray-900 text-white  hover:bg-gray-900"
              )}
            >
              {h}
            </div>
          ))}
        </ScrollArea>
        <ScrollArea className="h-60 p-1">
          {minutes.map((m) => (
            <div
              key={m}
              onClick={() => {
                setMinute(m);
                onTimeChange({ hours: hour ?? 0, minutes: m });
                if (hour == undefined) setHour(0);
              }}
              className={cn(
                "text-center p-2 cursor-pointer select-none text-black hover:bg-gray-100",
                m === minute && "bg-gray-900 text-white hover:bg-gray-900"
              )}
            >
              {m}
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
