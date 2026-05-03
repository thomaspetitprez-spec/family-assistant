export type Child = {
  name: string;
  level: string;
};

export type FamilyEvent = {
  id: string;
  title: string;
  child: string;
  day: string;
  startMinutes: number;
  endMinutes: number;
  location?: string;
  category: "school" | "kindy" | "homework" | "family" | "activity" | "detected";
  appliesDuringSchoolWeeks: boolean;
  appliesDuringHolidays: boolean;
  alwaysActive?: boolean;
};

export type SchoolHoliday = {
  id: string;
  name: string;
  state: "VIC";
  startDate: string;
  endDate: string;
};

export type DetectedItem = FamilyEvent & {
  columnIndex: number;
  columnCount: number;
};
