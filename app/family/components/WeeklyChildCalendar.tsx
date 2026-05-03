import type { FamilyEvent  } from "../types";
import type { SchoolHoliday } from "@/lib/services/schoolHolidaysService";

type WeeklyChildCalendarProps = {
  weekDays: string[];
  planningItems: FamilyEvent[];
  schoolHolidays: SchoolHoliday[];
};

const typeStyles: Record<FamilyEvent["category"], string> = {
  school: "border-sky-200 bg-sky-50 text-sky-900",
  kindy: "border-pink-200 bg-pink-50 text-pink-900",
  homework: "border-amber-200 bg-amber-50 text-amber-900",
  family: "border-gray-200 bg-gray-50 text-gray-900",
  activity: "border-emerald-200 bg-emerald-50 text-emerald-900",
  detected: "border-violet-200 bg-violet-50 text-violet-900",
};

export default function WeeklyChildCalendar({
  weekDays,
  planningItems,
  schoolHolidays,
}: WeeklyChildCalendarProps) {
  return (
    <section className="rounded-3xl bg-[#fffaf2] p-4 shadow-sm ring-1 ring-amber-100 sm:p-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
          Visual week
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-stone-950">
          Child planning calendar
        </h2>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {weekDays.map((day) => {
	  const dayItems = planningItems.filter((item) => item.day === day);
          const holiday = schoolHolidays.find(
            (schoolHoliday) =>
              day >= schoolHoliday.startDate && day <= schoolHoliday.endDate,
          );

          return (
            <article
              key={day}
              className="min-h-56 rounded-2xl border border-amber-100 bg-white/80 p-3"
            >
              <div className="border-b border-amber-100 pb-3">
                <p className="text-sm font-semibold text-stone-950">
                  {formatDayName(day)}
                </p>
                <p className="text-xs text-stone-500">{formatDayDate(day)}</p>
              </div>

              <div className="mt-3 space-y-3">
                {holiday && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
                    School holiday: {holiday.name}
                  </div>
                )}

                {dayItems.map((item) => (
                  <PlanningBlock key={item.id} item={item} />
                ))}

                {!holiday && dayItems.length === 0 && (
                  <p className="text-sm text-stone-400">No child plans.</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PlanningBlock({ item }: { item: FamilyEvent }) {
  return (
    <div className={`rounded-xl border p-3 ${typeStyles[item.category]}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{item.title}</h3>
        <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-medium capitalize">
          {item.category}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium">{item.child}</p>
      <p className="mt-2 text-xs">
        {formatMinutes(item.startMinutes)} - {formatMinutes(item.endMinutes)}
      </p>
      <p className="mt-2 text-xs leading-5">{item.notes}</p>
      {item.needsPreparation && (
        <p className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-xs font-medium">
          Preparation needed
        </p>
      )}
    </div>
  );
}

function formatDayName(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-AU", {
    weekday: "short",
  });
}

function formatDayDate(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateTime: string) {
  return new Date(dateTime).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
