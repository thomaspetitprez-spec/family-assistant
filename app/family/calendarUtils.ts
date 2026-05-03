import type { DetectedItem, FamilyEvent, SchoolHoliday } from "./types";

export const calendarStartMinutes = 7 * 60;
export const calendarEndMinutes = 20 * 60;
export const snapIntervalMinutes = 15;
export const minimumEventDurationMinutes = 15;
export const pixelsPerHour = 64;

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(
    2,
    "0",
  )}`;
}

export function snapMinutes(minutes: number, interval: number) {
  return Math.round(minutes / interval) * interval;
}

export function clampEventToDay(startMinutes: number, endMinutes: number) {
  const durationMinutes = Math.max(
    endMinutes - startMinutes,
    minimumEventDurationMinutes,
  );
  const maxStartMinutes = calendarEndMinutes - durationMinutes;
  const nextStartMinutes = Math.min(
    Math.max(startMinutes, calendarStartMinutes),
    maxStartMinutes,
  );
  const nextEndMinutes = nextStartMinutes + durationMinutes;

  return {
    startMinutes: nextStartMinutes,
    endMinutes: nextEndMinutes,
  };
}

export function getTimeFromYPosition(
  y: number,
  gridTop: number,
  currentPixelsPerHour: number,
) {
  const minutesFromGridStart = ((y - gridTop) / currentPixelsPerHour) * 60;
  const snappedMinutes = snapMinutes(
    calendarStartMinutes + minutesFromGridStart,
    snapIntervalMinutes,
  );

  return Math.min(
    Math.max(snappedMinutes, calendarStartMinutes),
    calendarEndMinutes,
  );
}

export function getTop(startMinutes: number) {
  return ((startMinutes - calendarStartMinutes) / 60) * pixelsPerHour;
}

export function getHeight(startMinutes: number, endMinutes: number) {
  return ((endMinutes - startMinutes) / 60) * pixelsPerHour;
}

export function getEventColor(child: string) {
  if (child === "Juliette") {
    return "bg-blue-100 border-blue-300 text-blue-900";
  }

  if (child === "Chloe") {
    return "bg-pink-100 border-pink-300 text-pink-900";
  }

  if (child === "Family") {
    return "bg-gray-100 border-gray-300 text-gray-800";
  }

  return "bg-amber-100 border-amber-300 text-amber-900";
}

export function getEventsForDay(day: string, events: FamilyEvent[]) {
  return events.filter((event) => event.day === day);
}

export function groupOverlappingEvents(dayEvents: FamilyEvent[]) {
  const sortedEvents = [...dayEvents].sort((firstEvent, secondEvent) => {
    return firstEvent.startMinutes - secondEvent.startMinutes;
  });
  const groups: FamilyEvent[][] = [];

  for (const event of sortedEvents) {
    const currentGroup = groups[groups.length - 1];

    if (!currentGroup) {
      groups.push([event]);
      continue;
    }

    const groupEnd = Math.max(
      ...currentGroup.map((groupEvent) => groupEvent.endMinutes),
    );

    if (event.startMinutes < groupEnd) {
      currentGroup.push(event);
    } else {
      groups.push([event]);
    }
  }

  return groups;
}

export function calculateEventLayout(
  event: FamilyEvent,
  group: FamilyEvent[],
): DetectedItem {
  return {
    ...event,
    columnIndex: group.indexOf(event),
    columnCount: group.length,
  };
}

export function isVictoriaSchoolHolidayWeek(
  selectedWeek: string,
  holidays: SchoolHoliday[],
) {
  const weekStart = new Date(`${selectedWeek}T12:00:00`);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return holidays.some((holiday) => {
    const holidayStart = new Date(`${holiday.startDate}T12:00:00`);
    const holidayEnd = new Date(`${holiday.endDate}T12:00:00`);

    return weekStart <= holidayEnd && weekEnd >= holidayStart;
  });
}
