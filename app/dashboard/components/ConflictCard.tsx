type Conflict = {
  reason: string;
  nextStep: string;
  events: string[];
};

type ConflictCardProps = {
  conflict: Conflict;
};

export default function ConflictCard({ conflict }: ConflictCardProps) {
  return (
    <article className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
        Conflict found
      </p>
      <h3 className="mt-2 text-lg font-semibold text-stone-950">
        {conflict.reason}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {conflict.events.map((event) => (
          <span
            key={event}
            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700"
          >
            {event}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-700">
        Suggested next step:{" "}
        <span className="font-semibold">{conflict.nextStep}</span>
      </p>
    </article>
  );
}
