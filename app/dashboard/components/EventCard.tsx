type Priority = "low" | "medium" | "high" | "urgent";

type Event = {
  title: string;
  category: string;
  person: string;
  priority: Priority;
  owner: "me" | "wife" | "child" | "family";
  sourceCalendar: string;
  startDateTime: string;
  endDateTime: string;
};

type EventCardProps = {
  event: Event;
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  urgent: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-500">
            {formatEventTime(event.startDateTime, event.endDateTime)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-stone-950">
            {event.title}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${priorityStyles[event.priority]}`}
        >
          {event.priority}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-stone-600">
        <InfoRow label="For" value={event.person} />
        <InfoRow label="Owner" value={event.owner} />
        <InfoRow label="Type" value={event.category} />
        <InfoRow label="Calendar" value={event.sourceCalendar} />
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-2">
      <span>{label}</span>
      <span className="text-right font-medium capitalize text-stone-900">
        {value}
      </span>
    </div>
  );
}

function formatEventTime(startDateTime: string, endDateTime: string) {
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);
  const date = startDate.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
  const start = startDate.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
  const end = endDate.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${date}, ${start} - ${end}`;
}
