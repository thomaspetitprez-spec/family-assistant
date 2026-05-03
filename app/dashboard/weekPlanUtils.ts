import type { FamilyEvent, SchoolHoliday } from "../family/types";

export type DetectedItem = {
  id: string;
  title: string;
  child: string;
  day: string;
  startMinutes?: number;
  endMinutes?: number;
  location?: string;
  confidence?: number;
  source: "calendar" | "email";
  type: "calendar" | "action";
};

export type WeekPlanInput = {
  weekStartDate: string;
  templateEvents: FamilyEvent[];
  schoolHolidays: SchoolHoliday[];
  detectedItems: DetectedItem[];
};

export type WeekPlan = {
  weekStartDate: string;
  isHolidayWeek: boolean;
  activeEvents: FamilyEvent[];
  disabledTemplateEvents: FamilyEvent[];
  detectedItems: DetectedItem[];
  warnings: string[];
};

export function generateWeekPlan({
  weekStartDate,
  templateEvents,
  schoolHolidays,
  detectedItems,
}: WeekPlanInput): WeekPlan {
  const isHolidayWeek = isVictoriaSchoolHolidayWeek(
    weekStartDate,
    schoolHolidays,
  );
  const activeEvents = templateEvents.filter((event) =>
    isHolidayWeek
      ? event.appliesDuringHolidays
      : event.appliesDuringSchoolWeeks,
  );
  const disabledTemplateEvents = templateEvents.filter(
    (event) => !activeEvents.some((activeEvent) => activeEvent.id === event.id),
  );
  const warnings = createWarnings({
    isHolidayWeek,
    disabledTemplateEvents,
    detectedItems,
  });

  return {
    weekStartDate,
    isHolidayWeek,
    activeEvents,
    disabledTemplateEvents,
    detectedItems,
    warnings,
  };
}

function isVictoriaSchoolHolidayWeek(
  weekStartDate: string,
  schoolHolidays: SchoolHoliday[],
) {
  const weekStart = new Date(`${weekStartDate}T12:00:00`);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return schoolHolidays.some((holiday) => {
    const holidayStart = new Date(`${holiday.startDate}T12:00:00`);
    const holidayEnd = new Date(`${holiday.endDate}T12:00:00`);

    return weekStart <= holidayEnd && weekEnd >= holidayStart;
  });
}

function createWarnings({
  isHolidayWeek,
  disabledTemplateEvents,
  detectedItems,
}: {
  isHolidayWeek: boolean;
  disabledTemplateEvents: FamilyEvent[];
  detectedItems: DetectedItem[];
}) {
  const warnings: string[] = [];
  const actionOnlyItems = detectedItems.filter((item) => item.type === "action");

  if (isHolidayWeek && disabledTemplateEvents.length > 0) {
    warnings.push(
      "Holiday week: school, kindy and homework template routines are disabled.",
    );
  }

  if (actionOnlyItems.length > 0) {
    warnings.push(
      `${actionOnlyItems.length} detected item needs action but has no calendar block.`,
    );
  }

  if (detectedItems.length === 0) {
    warnings.push("No detected calendar or email items are available yet.");
  }

  return warnings;
}
