import type { FamilyEvent } from "../family/types";
import type { DetectedItem } from "./weekPlanUtils";

export type IntelligenceSeverity = "low" | "medium" | "high";
export type IntelligenceSource = "template" | "detected" | "calendar" | "email";

export type IntelligenceItem = {
  id: string;
  title: string;
  severity: IntelligenceSeverity;
  relatedChild?: string;
  source: IntelligenceSource;
};

export type IntelligenceInput = {
  activeEvents: FamilyEvent[];
  detectedItems: DetectedItem[];
  isHolidayWeek: boolean;
};

export type IntelligenceResult = {
  warnings: IntelligenceItem[];
  actions: IntelligenceItem[];
};

export function generateWarningsAndActions({
  activeEvents,
  detectedItems,
  isHolidayWeek,
}: IntelligenceInput): IntelligenceResult {
  return {
    warnings: [
      ...detectTimeConflicts(activeEvents, detectedItems),
      ...detectFamilyLogisticsConflicts(activeEvents, detectedItems),
      ...detectMissingInformation(detectedItems),
      ...createHolidayWarnings(isHolidayWeek),
    ],
    actions: generateActions(detectedItems),
  };
}

function detectTimeConflicts(
  activeEvents: FamilyEvent[],
  detectedItems: DetectedItem[],
) {
  const warnings: IntelligenceItem[] = [];
  const timedItems = detectedItems.filter(hasTime);

  for (const detectedItem of timedItems) {
    const conflictingEvents = activeEvents.filter((event) => {
      return (
        event.child === detectedItem.child &&
        event.day === detectedItem.day &&
        timesOverlap(
          event.startMinutes,
          event.endMinutes,
          detectedItem.startMinutes,
          detectedItem.endMinutes,
        )
      );
    });

    for (const event of conflictingEvents) {
      warnings.push({
        id: `time-conflict-${event.id}-${detectedItem.id}`,
        title: `${detectedItem.child} has ${detectedItem.title} during ${event.title}.`,
        severity: "high",
        relatedChild: detectedItem.child,
        source: detectedItem.source,
      });
    }
  }

  return warnings;
}

function detectFamilyLogisticsConflicts(
  activeEvents: FamilyEvent[],
  detectedItems: DetectedItem[],
) {
  const warnings: IntelligenceItem[] = [];
  const events = [
    ...activeEvents.map((event) => ({
      id: event.id,
      title: event.title,
      child: event.child,
      day: event.day,
      startMinutes: event.startMinutes,
      endMinutes: event.endMinutes,
      location: event.location,
      source: "template" as const,
    })),
    ...detectedItems.filter(hasTime).map((item) => ({
      id: item.id,
      title: item.title,
      child: item.child,
      day: item.day,
      startMinutes: item.startMinutes,
      endMinutes: item.endMinutes,
      location: item.location,
      source: item.source,
    })),
  ];

  for (let index = 0; index < events.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < events.length; nextIndex += 1) {
      const firstEvent = events[index];
      const secondEvent = events[nextIndex];

      if (
        firstEvent.day !== secondEvent.day ||
        firstEvent.child === secondEvent.child ||
        firstEvent.child === "Family" ||
        secondEvent.child === "Family"
      ) {
        continue;
      }

      const startGap = Math.abs(firstEvent.startMinutes - secondEvent.startMinutes);
      const endGap = Math.abs(firstEvent.endMinutes - secondEvent.endMinutes);
      const hasDifferentLocations =
        firstEvent.location &&
        secondEvent.location &&
        firstEvent.location !== secondEvent.location;

      if (startGap <= 15 || endGap <= 15 || hasDifferentLocations) {
        warnings.push({
          id: `pickup-conflict-${firstEvent.id}-${secondEvent.id}`,
          title: `Possible pickup conflict: ${firstEvent.child} and ${secondEvent.child} have close timing.`,
          severity: hasDifferentLocations ? "high" : "medium",
          source:
            firstEvent.source === "template" && secondEvent.source === "template"
              ? "template"
              : "detected",
        });
      }
    }
  }

  return warnings;
}

function detectMissingInformation(detectedItems: DetectedItem[]) {
  const warnings: IntelligenceItem[] = [];

  for (const item of detectedItems) {
    if (!item.child) {
      warnings.push({
        id: `missing-child-${item.id}`,
        title: `${item.title} needs an assigned child.`,
        severity: "medium",
        source: item.source,
      });
    }

    if (!hasTime(item)) {
      warnings.push({
        id: `missing-time-${item.id}`,
        title: `${item.title} has no calendar time yet.`,
        severity: item.type === "action" ? "low" : "medium",
        relatedChild: item.child,
        source: item.source,
      });
    }

    if (item.confidence !== undefined && item.confidence < 0.7) {
      warnings.push({
        id: `low-confidence-${item.id}`,
        title: `${item.title} was detected with low confidence.`,
        severity: "medium",
        relatedChild: item.child,
        source: item.source,
      });
    }
  }

  return warnings;
}

function createHolidayWarnings(isHolidayWeek: boolean) {
  if (!isHolidayWeek) {
    return [];
  }

  return [
    {
      id: "holiday-week-routines-disabled",
      title: "Holiday week: school, kindy and homework routines are disabled.",
      severity: "medium" as const,
      source: "template" as const,
    },
  ];
}

function generateActions(detectedItems: DetectedItem[]) {
  const actions: IntelligenceItem[] = [];

  for (const item of detectedItems) {
    const title = item.title.toLowerCase();
    const baseAction = {
      relatedChild: item.child,
      source: item.source,
    };

    if (title.includes("invoice") || title.includes("payment")) {
      actions.push({
        id: `action-invoice-${item.id}`,
        title: "Pay or review invoice.",
        severity: "high",
        ...baseAction,
      });
    }

    if (title.includes("birthday party")) {
      actions.push({
        id: `action-party-${item.id}`,
        title: "Confirm attendance / buy gift.",
        severity: "medium",
        ...baseAction,
      });
    }

    if (title.includes("camp") || title.includes("childcare")) {
      actions.push({
        id: `action-camp-${item.id}`,
        title: "Confirm booking and pickup details.",
        severity: "medium",
        ...baseAction,
      });
    }

    if (title.includes("travel")) {
      actions.push({
        id: `action-travel-${item.id}`,
        title: "Check documents and packing list.",
        severity: "medium",
        ...baseAction,
      });
    }
  }

  return actions;
}

function hasTime(
  item: DetectedItem,
): item is DetectedItem & { startMinutes: number; endMinutes: number } {
  return item.startMinutes !== undefined && item.endMinutes !== undefined;
}

function timesOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) {
  return firstStart < secondEnd && secondStart < firstEnd;
}
