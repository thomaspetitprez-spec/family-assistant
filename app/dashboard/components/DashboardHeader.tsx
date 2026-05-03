type DashboardHeaderProps = {
  familyName: string;
  nextEvent: string;
  eventCount: number;
  actionCount: number;
  urgentCount: number;
};

export default function DashboardHeader({
  familyName,
  nextEvent,
  eventCount,
  actionCount,
  urgentCount,
}: DashboardHeaderProps) {
  return (
    <header className="rounded-3xl border border-amber-100 bg-[#fffaf2] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
            Today overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {familyName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Your shared family dashboard for events, reminders, and practical
            next steps.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:min-w-96">
          <SummaryItem label="Events" value={eventCount} />
          <SummaryItem label="Actions" value={actionCount} />
          <SummaryItem label="Urgent" value={urgentCount} highlight />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-amber-100 bg-[#f4ead8] p-4">
        <p className="text-sm text-stone-500">Next family event</p>
        <p className="mt-1 font-semibold text-stone-900">{nextEvent}</p>
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
      className={`rounded-xl border p-3 text-center ${
        highlight
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : "border-amber-100 bg-white/70 text-stone-900"
      }`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}
