import type { SchoolHolidayReference } from "@/lib/services/schoolHolidaysService";

type HolidayReferenceCardProps = {
  reference: SchoolHolidayReference;
};

export default function HolidayReferenceCard({
  reference,
}: HolidayReferenceCardProps) {
  return (
    <aside className="rounded-3xl bg-[#f4ead8] p-4 shadow-sm ring-1 ring-amber-200 sm:p-5">
      <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
        External reference data
      </p>
      <h2 className="mt-1 text-2xl font-semibold text-stone-950">
        School holidays
      </h2>

      <div className="mt-5 rounded-2xl border border-amber-100 bg-white/75 p-4">
        <p className="text-sm font-semibold text-stone-900">
          {reference.sourceName}
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Last updated: {formatDate(reference.lastUpdated)}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {reference.holidays.map((holiday) => (
          <article
            key={holiday.id}
            className="rounded-2xl border border-amber-100 bg-white/75 p-4"
          >
            <p className="font-semibold text-stone-950">{holiday.name}</p>
            <p className="mt-1 text-sm text-stone-600">
              {formatDate(holiday.startDate)} to {formatDate(holiday.endDate)}
            </p>
            <p className="mt-2 text-xs font-medium text-stone-500">
              State: {holiday.state}
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
