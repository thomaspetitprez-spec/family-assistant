"use client";

import { useState } from "react";
import {
  days,
  events as schoolWeekTemplateEvents,
  hours,
  schoolHolidays,
} from "../family/data";
import {
  calculateEventLayout,
  getEventsForDay,
  getHeight,
  getTop,
  groupOverlappingEvents,
  minutesToTime,
  pixelsPerHour,
} from "../family/calendarUtils";
import type { FamilyEvent as TemplateEvent } from "../family/types";
import ActionCard from "./components/ActionCard";
import ActionTabs from "./components/ActionTabs";
import ConflictCard from "./components/ConflictCard";
import DashboardHeader from "./components/DashboardHeader";
import EventCard from "./components/EventCard";
import SettingsCard from "./components/SettingsCard";
import {
  generateWarningsAndActions,
  type IntelligenceItem,
} from "./intelligenceUtils";
import {
  type DetectedItem,
  generateWeekPlan,
} from "./weekPlanUtils";

type Priority = "low" | "medium" | "high" | "urgent";
type Owner = "me" | "wife" | "child" | "family";

type FamilyEvent = {
  id: string;
  title: string;
  category: string;
  person: string;
  priority: Priority;
  owner: Owner;
  sourceCalendar: string;
  startDateTime: string;
  endDateTime: string;
};

type FamilyAction = {
  id: string;
  title: string;
  description: string;
  owner: string;
  due: string;
  priority: Priority;
};

type Conflict = {
  id: string;
  reason: string;
  nextStep: string;
  events: string[];
};

type WeekCalendarEvent = TemplateEvent & {
  sourceLabel?: string;
  isDetected?: boolean;
};

const calendarEvents: FamilyEvent[] = [
  {
    id: "emma-birthday",
    title: "Anniversaire Emma",
    category: "Birthday",
    person: "Emma",
    priority: "medium",
    owner: "family",
    sourceCalendar: "Kids iCloud Calendar",
    startDateTime: "2026-05-12T09:00:00",
    endDateTime: "2026-05-12T10:00:00",
  },
  {
    id: "school-payment",
    title: "Paiement ecole",
    category: "Payment",
    person: "School office",
    priority: "high",
    owner: "family",
    sourceCalendar: "Family Shared Calendar",
    startDateTime: "2026-05-08T08:30:00",
    endDateTime: "2026-05-08T09:00:00",
  },
  {
    id: "dentist",
    title: "Rendez-vous dentiste",
    category: "Medical",
    person: "Lucas",
    priority: "low",
    owner: "child",
    sourceCalendar: "Kids iCloud Calendar",
    startDateTime: "2026-05-15T09:30:00",
    endDateTime: "2026-05-15T10:15:00",
  },
  {
    id: "thomas-client-call",
    title: "Thomas client call",
    category: "Work",
    person: "Thomas",
    priority: "medium",
    owner: "me",
    sourceCalendar: "Thomas Google Calendar",
    startDateTime: "2026-05-08T14:30:00",
    endDateTime: "2026-05-08T16:00:00",
  },
  {
    id: "wife-team-meeting",
    title: "Wife team meeting",
    category: "Work",
    person: "Wife",
    priority: "medium",
    owner: "wife",
    sourceCalendar: "Wife Google Calendar",
    startDateTime: "2026-05-08T15:00:00",
    endDateTime: "2026-05-08T16:30:00",
  },
  {
    id: "school-pickup",
    title: "School pickup",
    category: "School",
    person: "Kids",
    priority: "urgent",
    owner: "family",
    sourceCalendar: "Kids iCloud Calendar",
    startDateTime: "2026-05-08T15:10:00",
    endDateTime: "2026-05-08T15:30:00",
  },
  {
    id: "football",
    title: "Lucas football",
    category: "Activity",
    person: "Lucas",
    priority: "medium",
    owner: "child",
    sourceCalendar: "Kids iCloud Calendar",
    startDateTime: "2026-05-10T10:00:00",
    endDateTime: "2026-05-10T11:00:00",
  },
  {
    id: "dance",
    title: "Emma dance class",
    category: "Activity",
    person: "Emma",
    priority: "medium",
    owner: "child",
    sourceCalendar: "Kids iCloud Calendar",
    startDateTime: "2026-05-10T10:15:00",
    endDateTime: "2026-05-10T11:15:00",
  },
];

const suggestedActions: FamilyAction[] = [
  {
    id: "buy-gift",
    title: "Acheter un cadeau",
    description: "Choose a birthday gift for Emma before the weekend.",
    owner: "Parent",
    due: "This week",
    priority: "medium",
  },
  {
    id: "confirm-dentist",
    title: "Confirmer le rendez-vous",
    description: "Call the dental clinic and confirm Lucas can attend.",
    owner: "Thomas",
    due: "Next week",
    priority: "low",
  },
];

const urgentActions: FamilyAction[] = [
  {
    id: "pay-school",
    title: "Payer la facture ecole",
    description: "Payment is due soon. Check the amount and submit it.",
    owner: "Thomas",
    due: "Today",
    priority: "urgent",
  },
  {
    id: "sign-trip",
    title: "Signer autorisation sortie",
    description: "Return the school trip permission form tomorrow morning.",
    owner: "Parent",
    due: "Tomorrow",
    priority: "high",
  },
];

const allActions = [...urgentActions, ...suggestedActions];
const visibleEvents = calendarEvents;
const mockDetectedItems: DetectedItem[] = [
  {
    id: "chloe-childcare-camp",
    title: "Chloe childcare camp",
    child: "Chloe",
    day: "Tue",
    startMinutes: 540,
    endMinutes: 900,
    location: "Community childcare centre",
    confidence: 0.92,
    source: "email",
    type: "calendar",
  },
  {
    id: "juliette-birthday-party",
    title: "Juliette birthday party",
    child: "Juliette",
    day: "Sat",
    startMinutes: 840,
    endMinutes: 960,
    location: "Birthday venue",
    confidence: 0.86,
    source: "calendar",
    type: "calendar",
  },
  {
    id: "swimming-invoice",
    title: "Swimming invoice due",
    child: "Family",
    day: "Fri",
    confidence: 0.66,
    source: "email",
    type: "action",
  },
];

export default function Dashboard() {
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStart());
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [deletedActions, setDeletedActions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "done">("active");
  const [scheduleRules, setScheduleRules] = useState({
    pickupTime: "15:15",
    dropoffTime: "08:30",
    preparationMinutes: 15,
    travelBufferMinutes: 20,
  });

  const activeActions = allActions.filter(
    (action) =>
      !completedActions.includes(action.id) && !deletedActions.includes(action.id),
  );
  const doneActions = allActions.filter(
    (action) =>
      completedActions.includes(action.id) && !deletedActions.includes(action.id),
  );
  const conflicts = findPotentialConflicts(calendarEvents);
  const weekPlan = generateWeekPlan({
    weekStartDate,
    templateEvents: schoolWeekTemplateEvents,
    schoolHolidays,
    detectedItems: mockDetectedItems,
  });
  const timedDetectedItems = weekPlan.detectedItems.filter(
    (item) =>
      item.type === "calendar" &&
      item.startMinutes !== undefined &&
      item.endMinutes !== undefined,
  );
  const actionOnlyDetectedItems = weekPlan.detectedItems.filter(
    (item) =>
      item.type === "action" ||
      item.startMinutes === undefined ||
      item.endMinutes === undefined,
  );
  const projectedCalendarEvents: WeekCalendarEvent[] = [
    ...weekPlan.activeEvents,
    ...timedDetectedItems.map((item) => ({
      id: item.id,
      title: item.title,
      child: item.child,
      day: item.day,
      startMinutes: item.startMinutes ?? 0,
      endMinutes: item.endMinutes ?? 0,
      category: "detected" as const,
      appliesDuringSchoolWeeks: true,
      appliesDuringHolidays: true,
      sourceLabel: item.source,
      isDetected: true,
    })),
  ];
  const intelligence = generateWarningsAndActions({
    activeEvents: weekPlan.activeEvents,
    detectedItems: weekPlan.detectedItems,
    isHolidayWeek: weekPlan.isHolidayWeek,
  });

  function markActionAsDone(actionId: string) {
    setCompletedActions((currentActions) =>
      currentActions.includes(actionId)
        ? currentActions
        : [...currentActions, actionId],
    );
  }

  function deleteAction(actionId: string) {
    setDeletedActions((currentActions) =>
      currentActions.includes(actionId)
        ? currentActions
        : [...currentActions, actionId],
    );
  }

  function moveWeek(daysToAdd: number) {
    const nextDate = new Date(`${weekStartDate}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    setWeekStartDate(formatDateInput(nextDate));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-stone-100 px-4 py-4 text-stone-950 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardHeader
          familyName="Family Assistant"
          eventCount={visibleEvents.length}
          actionCount={activeActions.length}
          urgentCount={activeActions.filter((action) => action.priority === "urgent").length}
        />

        <DashboardAlerts
          nextEvent={visibleEvents[0].title}
          actionCount={activeActions.length}
          warningCount={intelligence.warnings.length}
          conflictCount={conflicts.length}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <div id="week-plan" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5 xl:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-500">
                  Real week projection
                </p>
                <h2 className="mt-1 text-xl font-semibold text-stone-950 sm:text-2xl">
                  Week of {formatDisplayDate(weekPlan.weekStartDate)}
                </h2>
                <p className="mt-1 text-sm font-medium text-stone-600">
                  {weekPlan.isHolidayWeek ? "Holiday Week" : "School Week"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveWeek(-7)}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => moveWeek(7)}
                  className="rounded-lg bg-stone-950 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-800"
                >
                  Next
                </button>
              </div>
            </div>

            {weekPlan.isHolidayWeek && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                Holiday Week: school, kindy and homework routines are disabled.
                Timed detected items still appear in the weekly plan.
              </div>
            )}

            <ReadOnlyWeekCalendar
              events={projectedCalendarEvents}
              isHolidayWeek={weekPlan.isHolidayWeek}
            />

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <WeekPlanList
                id="detected-items"
                title="Detected actions"
                items={actionOnlyDetectedItems.map((item) => ({
                  id: item.id,
                  text: `${item.title} (${item.source})`,
                }))}
              />
              <WeekPlanList
                id="warnings"
                title="Warnings"
                items={intelligence.warnings.map(formatIntelligenceItem)}
              />
            </div>
          </div>

          <div id="family-events" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5">
            <SectionTitle eyebrow="Coming up" title="Family events" />

            <div className="relative mt-4">
              <div className="max-h-[420px] overflow-y-auto pr-1">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {visibleEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>

          <div className="space-y-5 xl:self-start">
            <div id="smart-warnings" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5">
              <SectionTitle eyebrow="Planning intelligence" title="Smart warnings" />
              <IntelligencePanel
                emptyMessage="No planning warnings for this week."
                items={intelligence.warnings}
              />
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5">
              <SectionTitle eyebrow="Suggested next steps" title="Smart actions" />
              <IntelligencePanel
                emptyMessage="No suggested actions from detected items yet."
                items={intelligence.actions}
              />
            </div>

            <div id="actions" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5">
              <SectionTitle eyebrow="Needs attention" title="Actions" />
              <ActionTabs
                activeTab={activeTab}
                activeCount={activeActions.length}
                doneCount={doneActions.length}
                onChangeTab={setActiveTab}
              />

              <div className="mt-4 grid gap-3">
                {activeTab === "active" &&
                  activeActions.map((action) => (
                    <ActionCard
                      key={action.id}
                      action={action}
                      onDelete={() => deleteAction(action.id)}
                      onMarkDone={() => markActionAsDone(action.id)}
                      showActions
                    />
                  ))}

                {activeTab === "active" && activeActions.length === 0 && (
                  <EmptyState message="No active actions right now." />
                )}

                {activeTab === "done" &&
                  doneActions.map((action) => (
                    <ActionCard key={action.id} action={action} isCompleted />
                  ))}

                {activeTab === "done" && doneActions.length === 0 && (
                  <EmptyState message="Completed actions will appear here." />
                )}
              </div>
            </div>

            <div id="conflicts" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5">
              <SectionTitle eyebrow="Calendar check" title="Potential conflicts" />
              <div className="mt-4 grid gap-3">
                {conflicts.map((conflict) => (
                  <ConflictCard key={conflict.id} conflict={conflict} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="settings">
          <SettingsCard
            rules={scheduleRules}
            onChangeRules={setScheduleRules}
          />
        </section>
      </div>
    </main>
  );
}

function DashboardAlerts({
  nextEvent,
  actionCount,
  warningCount,
  conflictCount,
}: {
  nextEvent: string;
  actionCount: number;
  warningCount: number;
  conflictCount: number;
}) {
  const alerts = [
    {
      href: "#family-events",
      label: "Next event",
      value: nextEvent,
    },
    {
      href: "#actions",
      label: "Open actions",
      value: `${actionCount} active`,
    },
    {
      href: "#smart-warnings",
      label: "Warnings",
      value: warningCount ? `${warningCount} to review` : "None",
    },
    {
      href: "#conflicts",
      label: "Conflicts",
      value: conflictCount ? `${conflictCount} found` : "None",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard alerts">
      {alerts.map((alert) => (
        <a
          key={alert.label}
          href={alert.href}
          className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
        >
          <p className="text-xs font-semibold uppercase text-stone-500">
            {alert.label}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-stone-950">
            {alert.value}
          </p>
        </a>
      ))}
    </section>
  );
}

function ReadOnlyWeekCalendar({
  events,
  isHolidayWeek,
}: {
  events: WeekCalendarEvent[];
  isHolidayWeek: boolean;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 bg-stone-50 px-4 py-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-stone-950">Generated week calendar</h3>
          <p className="text-sm text-stone-600">
            {isHolidayWeek
              ? "Holiday projection from always-active routines and detected items"
              : "School-week projection from the standard template"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[72px_repeat(7,minmax(128px,1fr))] border-b border-stone-200 bg-white">
            <div className="sticky left-0 z-20 border-r border-stone-200 bg-white" />
            {days.map((day) => (
              <div
                key={day}
                className="border-r border-stone-200 px-3 py-3 text-center text-sm font-semibold text-stone-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[72px_repeat(7,minmax(128px,1fr))]">
            <div className="sticky left-0 z-20 border-r border-stone-200 bg-stone-50">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-stone-200 pr-2 text-right text-xs text-stone-500"
                  style={{ height: pixelsPerHour }}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {days.map((day) => {
              const dayEvents = getEventsForDay(day, events);
              const laidOutEvents = groupOverlappingEvents(dayEvents).flatMap(
                (group) =>
                  group.map((event) => calculateEventLayout(event, group)),
              );

              return (
                <div
                  key={day}
                  className="relative border-r border-stone-200 bg-white last:border-r-0"
                  style={{ height: hours.length * pixelsPerHour }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-stone-100"
                      style={{ height: pixelsPerHour }}
                    />
                  ))}

                  {laidOutEvents.map((event) => (
                    <ReadOnlyCalendarEvent key={event.id} event={event} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyCalendarEvent({
  event,
}: {
  event: WeekCalendarEvent & { columnIndex: number; columnCount: number };
}) {
  const width = `${100 / event.columnCount}%`;
  const left = `${(event.columnIndex * 100) / event.columnCount}%`;
  const duration = event.endMinutes - event.startMinutes;
  const showDetails = duration >= 45;
  const showCompactTitle = duration >= 30;

  return (
    <div
      className={`absolute overflow-hidden rounded-lg border px-2 py-1 text-xs shadow-sm ${getDashboardEventColor(
        event,
      )}`}
      style={{
        top: getTop(event.startMinutes),
        height: Math.max(getHeight(event.startMinutes, event.endMinutes), 18),
        width,
        left,
      }}
      title={`${event.title} ${minutesToTime(event.startMinutes)}-${minutesToTime(
        event.endMinutes,
      )}`}
    >
      {showCompactTitle ? (
        <>
          <p className="truncate font-semibold">{event.title}</p>
          {showDetails && (
            <p className="truncate opacity-80">
              {event.child} - {minutesToTime(event.startMinutes)}-
              {minutesToTime(event.endMinutes)}
            </p>
          )}
        </>
      ) : (
        <div className="h-full rounded-full bg-current opacity-60" />
      )}
    </div>
  );
}

function getDashboardEventColor(event: WeekCalendarEvent) {
  if (event.isDetected || event.category === "detected") {
    return "bg-purple-100 border-purple-300 text-purple-900";
  }

  if (event.category === "activity") {
    return "bg-amber-100 border-amber-300 text-amber-900";
  }

  if (event.child === "Juliette") {
    return "bg-blue-100 border-blue-300 text-blue-900";
  }

  if (event.child === "Chloe") {
    return "bg-pink-100 border-pink-300 text-pink-900";
  }

  return "bg-gray-100 border-gray-300 text-gray-800";
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-stone-500">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold text-stone-950">{title}</h2>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
      {message}
    </div>
  );
}

function WeekPlanList({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: { id: string; text: string }[];
}) {
  return (
    <div id={id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <h3 className="font-semibold text-stone-950">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <p key={item.id} className="text-sm text-stone-700">
              {item.text}
            </p>
          ))
        ) : (
          <p className="text-sm text-stone-500">None</p>
        )}
      </div>
    </div>
  );
}

function IntelligencePanel({
  emptyMessage,
  items,
}: {
  emptyMessage: string;
  items: IntelligenceItem[];
}) {
  return (
    <div className="mt-4 grid gap-3">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-stone-200 bg-stone-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-950">{item.title}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {item.relatedChild ? `${item.relatedChild} - ` : ""}
                  Source: {item.source}
                </p>
              </div>
              <SeverityBadge severity={item.severity} />
            </div>
          </div>
        ))
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: IntelligenceItem["severity"];
}) {
  const classes = {
    low: "bg-stone-100 text-stone-700",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[severity]}`}
    >
      {severity}
    </span>
  );
}

function formatIntelligenceItem(item: IntelligenceItem) {
  return {
    id: item.id,
    text: `${item.title} (${item.severity}, ${item.source})`,
  };
}

function getCurrentWeekStart() {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  today.setDate(today.getDate() + mondayOffset);

  return formatDateInput(today);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function findPotentialConflicts(events: FamilyEvent[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const meEvents = events.filter((event) => event.owner === "me");
  const wifeEvents = events.filter((event) => event.owner === "wife");
  const pickupEvents = events.filter((event) => event.category === "School");
  const childActivities = events.filter((event) => event.category === "Activity");

  for (const meEvent of meEvents) {
    for (const wifeEvent of wifeEvents) {
      if (eventsOverlap(meEvent, wifeEvent)) {
        conflicts.push({
          id: `parents-${meEvent.id}-${wifeEvent.id}`,
          reason: "Parent 1 and Parent 2 are both busy at overlapping times.",
          nextStep: "Decide who can move a meeting or ask for pickup help.",
          events: [meEvent.title, wifeEvent.title],
        });
      }
    }
  }

  for (const pickupEvent of pickupEvents) {
    const meBusy = meEvents.some((event) => eventsOverlap(event, pickupEvent));
    const wifeBusy = wifeEvents.some((event) => eventsOverlap(event, pickupEvent));

    if (meBusy && wifeBusy) {
      conflicts.push({
        id: `pickup-${pickupEvent.id}`,
        reason: "School pickup overlaps with both parents being busy.",
        nextStep: "Arrange pickup coverage or adjust one parent calendar.",
        events: [pickupEvent.title],
      });
    }
  }

  for (let index = 0; index < childActivities.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < childActivities.length; nextIndex += 1) {
      const firstEvent = childActivities[index];
      const secondEvent = childActivities[nextIndex];

      if (eventsOverlap(firstEvent, secondEvent)) {
        conflicts.push({
          id: `children-${firstEvent.id}-${secondEvent.id}`,
          reason: "Two child activities happen at the same time.",
          nextStep: "Choose a driver for each activity or reschedule one activity.",
          events: [firstEvent.title, secondEvent.title],
        });
      }
    }
  }

  return conflicts;
}

function eventsOverlap(firstEvent: FamilyEvent, secondEvent: FamilyEvent) {
  const firstStart = new Date(firstEvent.startDateTime).getTime();
  const firstEnd = new Date(firstEvent.endDateTime).getTime();
  const secondStart = new Date(secondEvent.startDateTime).getTime();
  const secondEnd = new Date(secondEvent.endDateTime).getTime();

  return firstStart < secondEnd && secondStart < firstEnd;
}
