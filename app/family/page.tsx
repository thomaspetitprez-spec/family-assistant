"use client";

import { useEffect, useState } from "react";
import {
  calculateEventLayout,
  clampEventToDay,
  calendarEndMinutes,
  calendarStartMinutes,
  getEventColor,
  getEventsForDay,
  getHeight,
  getTop,
  groupOverlappingEvents,
  minimumEventDurationMinutes,
  minutesToTime,
  pixelsPerHour,
  snapIntervalMinutes,
  snapMinutes,
  timeToMinutes,
} from "./calendarUtils";
import EventEditor, { type EventFormValues } from "./components/EventEditor";
import { children, days, events as initialEvents, hours } from "./data";
import type { DetectedItem, FamilyEvent } from "./types";

type DragState = {
  eventId: string;
  pointerStartX: number;
  pointerStartY: number;
  originalDay: string;
  originalDayIndex: number;
  originalStartMinutes: number;
  originalEndMinutes: number;
  dayColumnWidth: number;
};

type ResizeState = {
  eventId: string;
  edge: "top" | "bottom";
  pointerStartY: number;
  originalStartMinutes: number;
  originalEndMinutes: number;
};

function createEmptyFormValues(): EventFormValues {
  return {
    title: "",
    child: children[0].name,
    day: days[0],
    startTime: "09:00",
    endTime: "10:00",
  };
}

function createFormValues(event: FamilyEvent): EventFormValues {
  return {
    title: event.title,
    child: event.child,
    day: event.day,
    startTime: minutesToTime(event.startMinutes),
    endTime: minutesToTime(event.endMinutes),
  };
}

export default function FamilyPage() {
  const [calendarEvents, setCalendarEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<FamilyEvent | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draftEvent, setDraftEvent] = useState<EventFormValues | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [formValues, setFormValues] = useState<EventFormValues>(
    createEmptyFormValues,
  );

 useEffect(() => {
  if (!dragState) return;

  const activeDragState = dragState;

  const previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";

  function updateDraggedEvent(
    nextDay: string,
    nextStartMinutes: number,
    nextEndMinutes: number,
  ) {
    setCalendarEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === activeDragState.eventId
          ? {
              ...event,
              day: nextDay,
              startMinutes: nextStartMinutes,
              endMinutes: nextEndMinutes,
            }
          : event,
      ),
    );

    setSelectedEvent((currentEvent) =>
      currentEvent?.id === activeDragState.eventId
        ? {
            ...currentEvent,
            day: nextDay,
            startMinutes: nextStartMinutes,
            endMinutes: nextEndMinutes,
          }
        : currentEvent,
    );

    setFormValues((currentValues) => ({
      ...currentValues,
      day: nextDay,
      startTime: minutesToTime(nextStartMinutes),
      endTime: minutesToTime(nextEndMinutes),
    }));

    setDraftEvent((currentValues) =>
      currentValues
        ? {
            ...currentValues,
            day: nextDay,
            startTime: minutesToTime(nextStartMinutes),
            endTime: minutesToTime(nextEndMinutes),
          }
        : currentValues,
    );
  }

  function handlePointerMove(pointerEvent: PointerEvent) {
    const deltaX = pointerEvent.clientX - activeDragState.pointerStartX;
    const deltaPixels = pointerEvent.clientY - activeDragState.pointerStartY;

    const deltaMinutes = (deltaPixels / pixelsPerHour) * 60;
    const snappedDeltaMinutes = snapMinutes(
      deltaMinutes,
      snapIntervalMinutes,
    );

    const dayOffset = Math.round(deltaX / activeDragState.dayColumnWidth);

    const nextDayIndex = Math.min(
      Math.max(activeDragState.originalDayIndex + dayOffset, 0),
      days.length - 1,
    );

    const nextEvent = clampEventToDay(
      activeDragState.originalStartMinutes + snappedDeltaMinutes,
      activeDragState.originalEndMinutes + snappedDeltaMinutes,
    );

    updateDraggedEvent(
      days[nextDayIndex],
      nextEvent.startMinutes,
      nextEvent.endMinutes,
    );
  }

  function handlePointerUp() {
    setDragState(null);
  }

  function handleKeyDown(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key !== "Escape") return;

    updateDraggedEvent(
      activeDragState.originalDay,
      activeDragState.originalStartMinutes,
      activeDragState.originalEndMinutes,
    );

    setDragState(null);
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.userSelect = previousUserSelect;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [dragState]);

 useEffect(() => {
  if (!resizeState) return;

  const activeResizeState = resizeState;

  const previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";

  function updateResizedEvent(
    nextStartMinutes: number,
    nextEndMinutes: number,
  ) {
    setCalendarEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === activeResizeState.eventId
          ? {
              ...event,
              startMinutes: nextStartMinutes,
              endMinutes: nextEndMinutes,
            }
          : event,
      ),
    );

    setSelectedEvent((currentEvent) =>
      currentEvent?.id === activeResizeState.eventId
        ? {
            ...currentEvent,
            startMinutes: nextStartMinutes,
            endMinutes: nextEndMinutes,
          }
        : currentEvent,
    );

    setFormValues((currentValues) => ({
      ...currentValues,
      startTime: minutesToTime(nextStartMinutes),
      endTime: minutesToTime(nextEndMinutes),
    }));

    setDraftEvent((currentValues) =>
      currentValues
        ? {
            ...currentValues,
            startTime: minutesToTime(nextStartMinutes),
            endTime: minutesToTime(nextEndMinutes),
          }
        : currentValues,
    );
  }

  function handlePointerMove(pointerEvent: PointerEvent) {
    const deltaPixels = pointerEvent.clientY - activeResizeState.pointerStartY;

    const deltaMinutes = (deltaPixels / pixelsPerHour) * 60;
    const snappedDeltaMinutes = snapMinutes(
      deltaMinutes,
      snapIntervalMinutes,
    );

    if (activeResizeState.edge === "top") {
      const latestAllowedStart =
        activeResizeState.originalEndMinutes - minimumEventDurationMinutes;

      const nextStartMinutes = Math.min(
        Math.max(
          activeResizeState.originalStartMinutes + snappedDeltaMinutes,
          calendarStartMinutes,
        ),
        latestAllowedStart,
      );

      updateResizedEvent(
        nextStartMinutes,
        activeResizeState.originalEndMinutes,
      );
      return;
    }

    const earliestAllowedEnd =
      activeResizeState.originalStartMinutes + minimumEventDurationMinutes;

    const nextEndMinutes = Math.max(
      Math.min(
        activeResizeState.originalEndMinutes + snappedDeltaMinutes,
        calendarEndMinutes,
      ),
      earliestAllowedEnd,
    );

    updateResizedEvent(
      activeResizeState.originalStartMinutes,
      nextEndMinutes,
    );
  }

  function handlePointerUp() {
    setResizeState(null);
  }

  function handleKeyDown(keyboardEvent: KeyboardEvent) {
    if (keyboardEvent.key !== "Escape") return;

    updateResizedEvent(
      activeResizeState.originalStartMinutes,
      activeResizeState.originalEndMinutes,
    );

    setResizeState(null);
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    document.body.style.userSelect = previousUserSelect;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [resizeState]);

  useEffect(() => {
    if (!isEditorOpen || dragState || resizeState) {
      return;
    }

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        closeEditor();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dragState, isEditorOpen, resizeState]);

  function openCreateEvent() {
    const emptyFormValues = createEmptyFormValues();

    setSelectedEvent(null);
    setSelectedEventId(null);
    setFormValues(emptyFormValues);
    setDraftEvent(emptyFormValues);
    setIsCreating(true);
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setDragState(null);
    setResizeState(null);
    setSelectedEvent(null);
    setSelectedEventId(null);
    setDraftEvent(null);
    setIsCreating(false);
  }

  function updateFormValues(nextFormValues: EventFormValues) {
    setFormValues(nextFormValues);
    setDraftEvent(nextFormValues);
  }

  function startEventDrag(
    event: FamilyEvent,
    pointerX: number,
    pointerY: number,
    dayColumnWidth: number,
  ) {
    const nextFormValues = createFormValues(event);

    setResizeState(null);
    setSelectedEvent(event);
    setSelectedEventId(event.id);
    setFormValues(nextFormValues);
    setDraftEvent(nextFormValues);
    setIsCreating(false);
    setDragState({
      eventId: event.id,
      pointerStartX: pointerX,
      pointerStartY: pointerY,
      originalDay: event.day,
      originalDayIndex: Math.max(days.indexOf(event.day), 0),
      originalStartMinutes: event.startMinutes,
      originalEndMinutes: event.endMinutes,
      dayColumnWidth,
    });
  }

  function startEventResize(
    event: FamilyEvent,
    edge: "top" | "bottom",
    pointerY: number,
  ) {
    const nextFormValues = createFormValues(event);

    setDragState(null);
    setSelectedEvent(event);
    setSelectedEventId(event.id);
    setFormValues(nextFormValues);
    setDraftEvent(nextFormValues);
    setIsCreating(false);
    setResizeState({
      eventId: event.id,
      edge,
      pointerStartY: pointerY,
      originalStartMinutes: event.startMinutes,
      originalEndMinutes: event.endMinutes,
    });
  }

  function openEditEvent(event: FamilyEvent) {
    const nextFormValues = createFormValues(event);

    setSelectedEvent(event);
    setSelectedEventId(event.id);
    setFormValues(nextFormValues);
    setDraftEvent(nextFormValues);
    setIsCreating(false);
    setIsEditorOpen(true);
  }

  function saveEvent() {
    const snappedStartMinutes = snapMinutes(
      timeToMinutes(formValues.startTime),
      snapIntervalMinutes,
    );
    const snappedEndMinutes = snapMinutes(
      timeToMinutes(formValues.endTime),
      snapIntervalMinutes,
    );
    const clampedEvent = clampEventToDay(
      snappedStartMinutes,
      snappedEndMinutes,
    );
    const savedEvent: FamilyEvent = {
      id: selectedEvent?.id ?? `event-${Date.now()}`,
      title: formValues.title || "Untitled event",
      child: formValues.child,
      day: formValues.day,
      startMinutes: clampedEvent.startMinutes,
      endMinutes: clampedEvent.endMinutes,
      category: selectedEvent?.category ?? "activity",
      appliesDuringSchoolWeeks: selectedEvent?.appliesDuringSchoolWeeks ?? true,
      appliesDuringHolidays: selectedEvent?.appliesDuringHolidays ?? true,
      alwaysActive: selectedEvent?.alwaysActive,
    };

    if (selectedEventId) {
      setCalendarEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === selectedEventId ? savedEvent : event,
        ),
      );
    } else {
      setCalendarEvents((currentEvents) => [...currentEvents, savedEvent]);
    }

    closeEditor();
  }

  function deleteEvent() {
    if (!selectedEvent) {
      return;
    }

    setCalendarEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== selectedEvent.id),
    );
    closeEditor();
  }

  return (
    <main
      className={`min-h-screen bg-gray-50 p-6 ${
        dragState || resizeState ? "select-none" : ""
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Standard School Week Template</h1>
          <p className="mt-2 text-gray-600">
            This template applies every normal school week.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateEvent}
          className="rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
        >
          Create new event
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-700">
          During Victoria school holidays, school-week routines will be disabled
          in the dashboard. The app will rely on detected camps, childcare,
          travel and activities instead.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        {children.map((child) => (
          <div key={child.name} className="rounded-xl bg-white px-4 py-2 shadow-sm">
            <div className="font-medium">{child.name}</div>
            <div className="text-xs text-gray-500">{child.level}</div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b">
          <div />
          {days.map((day) => (
            <div key={day} className="border-l p-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[64px_repeat(7,1fr)]">
          <div>
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b pr-2 text-right text-xs text-gray-400">
                {hour}:00
              </div>
            ))}
          </div>

          {days.map((day) => (
            <div key={day} className="relative h-[896px] border-l">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b border-gray-100" />
              ))}

              {groupOverlappingEvents(getEventsForDay(day, calendarEvents))
                .flatMap((group) =>
                  group.map((event) => calculateEventLayout(event, group)),
                )
                .map((event) => (
                  <CalendarEventButton
                    key={event.id}
                    event={event}
                    isSelected={selectedEvent?.id === event.id}
                    isDragging={dragState?.eventId === event.id}
                    isResizing={resizeState?.eventId === event.id}
                    onStartDrag={(pointerX, pointerY, dayColumnWidth) =>
                      startEventDrag(event, pointerX, pointerY, dayColumnWidth)
                    }
                    onOpenEditor={() => openEditEvent(event)}
                    onStartResize={(edge, pointerY) =>
                      startEventResize(event, edge, pointerY)
                    }
                  />
                ))}
            </div>
          ))}
        </div>
      </section>

      {isEditorOpen && (
        <EventEditor
          childrenList={children}
          days={days}
          event={isCreating ? null : selectedEvent}
          formValues={draftEvent ?? formValues}
          onCancel={closeEditor}
          onChange={updateFormValues}
          onClose={closeEditor}
          onDelete={deleteEvent}
          onSave={saveEvent}
        />
      )}
    </main>
  );
}

function CalendarEventButton({
  event,
  isSelected,
  isDragging,
  isResizing,
  onStartDrag,
  onOpenEditor,
  onStartResize,
}: {
  event: DetectedItem;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  onStartDrag: (
    pointerX: number,
    pointerY: number,
    dayColumnWidth: number,
  ) => void;
  onOpenEditor: () => void;
  onStartResize: (edge: "top" | "bottom", pointerY: number) => void;
}) {
  const durationMinutes = event.endMinutes - event.startMinutes;
  const isVerySmall = durationMinutes < 30;
  const isSmall = durationMinutes < 45;

  return (
    <button
      type="button"
      onDoubleClick={(event) => {
        event.preventDefault();
        onOpenEditor();
      }}
      onPointerDown={(pointerEvent) => {
        pointerEvent.preventDefault();
        const dayColumn = pointerEvent.currentTarget.parentElement;
        const dayColumnWidth =
          dayColumn?.getBoundingClientRect().width ||
          pointerEvent.currentTarget.offsetWidth ||
          1;

        onStartDrag(
          pointerEvent.clientX,
          pointerEvent.clientY,
          dayColumnWidth,
        );
      }}
      className={`absolute cursor-grab touch-none overflow-hidden rounded-xl border p-2 text-left text-xs opacity-90 shadow-sm active:cursor-grabbing ${getEventColor(
        event.child,
      )} ${
        isSelected ? "z-10 ring-2 ring-gray-950 ring-offset-1" : ""
      } ${
        isDragging || isResizing
          ? "shadow-lg ring-2 ring-gray-950 ring-offset-1"
          : ""
      }`}
      style={{
        top: `${getTop(event.startMinutes)}px`,
        height: `${getHeight(event.startMinutes, event.endMinutes)}px`,
        left: `${(100 / event.columnCount) * event.columnIndex}%`,
        width: `${100 / event.columnCount}%`,
      }}
    >
      <span
        aria-hidden="true"
        onPointerDown={(pointerEvent) => {
          pointerEvent.preventDefault();
          pointerEvent.stopPropagation();
          onStartResize("top", pointerEvent.clientY);
        }}
        className={`absolute inset-x-2 top-1 h-1 cursor-ns-resize rounded-full bg-current/30 transition-opacity ${
          isSelected || isResizing ? "opacity-100" : "opacity-0"
        } hover:opacity-100`}
      />

      {isVerySmall ? (
        <div className="h-full rounded-full bg-current/20" />
      ) : (
        <>
          <div className="truncate font-semibold">{event.title}</div>
          {!isSmall && (
            <>
              <div className="truncate">{event.child}</div>
              <div className="truncate opacity-70">
                {minutesToTime(event.startMinutes)} -{" "}
                {minutesToTime(event.endMinutes)}
              </div>
            </>
          )}
        </>
      )}

      <span
        aria-hidden="true"
        onPointerDown={(pointerEvent) => {
          pointerEvent.preventDefault();
          pointerEvent.stopPropagation();
          onStartResize("bottom", pointerEvent.clientY);
        }}
        className={`absolute inset-x-2 bottom-1 h-1 cursor-ns-resize rounded-full bg-current/30 transition-opacity ${
          isSelected || isResizing ? "opacity-100" : "opacity-0"
        } hover:opacity-100`}
      />
    </button>
  );
}
