export type SchoolHoliday = {
  id: string;
  name: string;
  state: "VIC";
  startDate: string;
  endDate: string;
};

export type SchoolHolidayReference = {
  sourceName: string;
  sourceUrl: string;
  lastUpdated: string;
  holidays: SchoolHoliday[];
};

const victoriaSchoolHolidays2026: SchoolHoliday[] = [
  {
    id: "vic-2026-autumn",
    name: "Autumn school holidays",
    state: "VIC",
    startDate: "2026-04-03",
    endDate: "2026-04-17",
  },
  {
    id: "vic-2026-winter",
    name: "Winter school holidays",
    state: "VIC",
    startDate: "2026-06-27",
    endDate: "2026-07-12",
  },
  {
    id: "vic-2026-spring",
    name: "Spring school holidays",
    state: "VIC",
    startDate: "2026-09-19",
    endDate: "2026-10-04",
  },
  {
    id: "vic-2026-summer",
    name: "Summer school holidays",
    state: "VIC",
    startDate: "2026-12-19",
    endDate: "2027-01-26",
  },
];

export async function getVictoriaSchoolHolidays(): Promise<SchoolHolidayReference> {
  // TODO: Replace this mock provider with an official import/fetch from the
  // Victorian Government school term dates source.
  // TODO: Add validation around date ranges when the official source is parsed.
  return {
    sourceName: "Victorian Government school term dates and holidays",
    sourceUrl: "https://www.vic.gov.au/school-term-dates-and-holidays-victoria",
    lastUpdated: "2026-04-03",
    holidays: victoriaSchoolHolidays2026,
  };
}
