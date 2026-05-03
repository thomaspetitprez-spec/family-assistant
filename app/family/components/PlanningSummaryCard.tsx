import type { SchoolHoliday } from "@/lib/services/schoolHolidaysService";

type PlanningSummaryCardProps = {
  itemCount: number;
  upcomingHoliday?: SchoolHoliday;
};

export default function PlanningSummaryCard({
  itemCount,
  upcomingHoliday,
}: PlanningSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-[#f4ead8] p-4">
      <p className="text-sm text-stone-500">This week</p>
      <p className="mt-1 text-3xl font-bold text-stone-950">{itemCount}</p>
      <p className="text-sm text-stone-600">child planning items</p>

      {upcomingHoliday && (
        <div className="mt-4 rounded-xl bg-white/70 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Next school holiday
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-900">
            {upcomingHoliday.name}
          </p>
        </div>
      )}
    </div>
  );
}
