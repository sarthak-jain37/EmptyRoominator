export interface ClassSession {
  code: string;
  title: string;
  start: string; // e.g. "08:00 AM"
  end: string;   // e.g. "08:55 AM"
  prof: string;
  term: string;
}

export interface FreeSlot {
  start: number; // minutes from midnight (e.g. 480 = 8:00 AM)
  end: number;   // minutes from midnight (e.g. 1200 = 8:00 PM)
  duration: number; // in minutes
}

export interface DaySchedule {
  classes: ClassSession[];
  free_slots: FreeSlot[];
}

export type PhaseTimetableData = Record<string, Record<string, Record<string, DaySchedule>>>;

export type MultiPhaseTimetableData = {
  first_half: PhaseTimetableData;
  second_half: PhaseTimetableData;
};

export type TimetableData = PhaseTimetableData;

export type AvailabilityType = "full" | "partial" | "unavailable";

export interface RoomAvailabilityResult {
  room: string;
  block: string;
  status: "full" | "partial";
  durationAvailable: number; // in minutes
  freeStart: number;         // in minutes
  freeEnd: number;           // in minutes
  nextClassStart?: string;   // formatted time e.g. "11:45 AM"
}

export interface SearchParams {
  block: string; // "ALL" or specific block like "A", "B", etc.
  day: string;   // "Mon", "Tue", ...
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
}

export type Theme = "system" | "light" | "dark";
