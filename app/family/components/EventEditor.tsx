import type { Child, FamilyEvent } from "../types";

export type EventFormValues = {
  title: string;
  child: string;
  day: string;
  startTime: string;
  endTime: string;
};

type EventEditorProps = {
  childrenList: Child[];
  days: string[];
  event: FamilyEvent | null;
  formValues: EventFormValues;
  onCancel: () => void;
  onChange: (values: EventFormValues) => void;
  onClose: () => void;
  onDelete: () => void;
  onSave: () => void;
};

export default function EventEditor({
  childrenList,
  days,
  event,
  formValues,
  onCancel,
  onChange,
  onClose,
  onDelete,
  onSave,
}: EventEditorProps) {
  const isEditing = event !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Calendar event
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-950">
              {isEditing ? "Edit event" : "Create new event"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close event editor"
            className="rounded-lg border px-3 py-2 text-lg font-semibold leading-none text-gray-600 hover:bg-gray-50"
          >
            X
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-gray-700">Title</span>
            <input
              type="text"
              value={formValues.title}
              onChange={(changeEvent) =>
                onChange({ ...formValues, title: changeEvent.target.value })
              }
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="Event title"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-gray-700">Child</span>
            <select
              value={formValues.child}
              onChange={(changeEvent) =>
                onChange({ ...formValues, child: changeEvent.target.value })
              }
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              {childrenList.map((child) => (
                <option key={child.name} value={child.name}>
                  {child.name}
                </option>
              ))}
              <option value="Family">Family</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-gray-700">Day</span>
            <select
              value={formValues.day}
              onChange={(changeEvent) =>
                onChange({ ...formValues, day: changeEvent.target.value })
              }
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">
                Start time
              </span>
              <input
                type="time"
                step={900}
                value={formValues.startTime}
                onChange={(changeEvent) =>
                  onChange({
                    ...formValues,
                    startTime: changeEvent.target.value,
                  })
                }
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-gray-700">
                End time
              </span>
              <input
                type="time"
                step={900}
                value={formValues.endTime}
                onChange={(changeEvent) =>
                  onChange({ ...formValues, endTime: changeEvent.target.value })
                }
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {isEditing && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Delete event
            </button>
          )}

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Save
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
