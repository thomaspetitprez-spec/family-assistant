type DashboardHeaderProps = {
  familyName: string;
  eventCount: number;
  actionCount: number;
  urgentCount: number;
};

export default function DashboardHeader({
  familyName,
  eventCount,
  actionCount,
  urgentCount,
}: DashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-stone-500">
            Today overview
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {familyName}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
            Your shared family dashboard for events, reminders, and practical
            next steps.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-80">
          <SummaryItem label="Events" value={eventCount} />
          <SummaryItem label="Actions" value={actionCount} />
          <SummaryItem label="Urgent" value={urgentCount} highlight />
        </div>
      </div>
    </header>
  );
}

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center ${
        highlight
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : "border-stone-200 bg-stone-50 text-stone-900"
      }`}
    >
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase">
        {label}
      </p>
    </div>
  );
}
