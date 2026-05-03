type Priority = "low" | "medium" | "high" | "urgent";

type Action = {
  title: string;
  description: string;
  owner: string;
  due: string;
  priority: Priority;
};

type ActionCardProps = {
  action: Action;
  isCompleted?: boolean;
  onDelete?: () => void;
  onMarkDone?: () => void;
  showActions?: boolean;
};

const priorityStyles: Record<Priority, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  urgent: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function ActionCard({
  action,
  isCompleted = false,
  onDelete,
  onMarkDone,
  showActions = false,
}: ActionCardProps) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/90"
          : "border-amber-100 bg-white/85"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-lg font-semibold ${
            isCompleted ? "text-emerald-900 line-through" : "text-stone-950"
          }`}
        >
          {action.title}
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${priorityStyles[action.priority]}`}
        >
          {isCompleted ? "done" : action.priority}
        </span>
      </div>

      <p
        className={`mt-3 text-sm leading-6 ${
          isCompleted ? "text-emerald-800" : "text-stone-600"
        }`}
      >
        {action.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isCompleted
              ? "bg-white text-emerald-800"
              : "bg-amber-50 text-stone-700"
          }`}
        >
          Owner: {action.owner}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isCompleted
              ? "bg-white text-emerald-800"
              : "bg-amber-50 text-stone-700"
          }`}
        >
          Due: {action.due}
        </span>
      </div>

      {showActions && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onMarkDone}
            className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 sm:w-auto"
          >
            Mark as done
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-full rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
