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
      className={`rounded-xl border p-4 shadow-sm ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/90"
          : "border-stone-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-base font-semibold ${
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
        className={`mt-2 text-sm leading-6 ${
          isCompleted ? "text-emerald-800" : "text-stone-600"
        }`}
      >
        {action.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isCompleted
              ? "bg-white text-emerald-800"
              : "bg-stone-100 text-stone-700"
          }`}
        >
          Owner: {action.owner}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isCompleted
              ? "bg-white text-emerald-800"
              : "bg-stone-100 text-stone-700"
          }`}
        >
          Due: {action.due}
        </span>
      </div>

      {showActions && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onMarkDone}
            className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Mark as done
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
