export interface ScheduleEntry {
  course: string;
  title: string;
  component: 'LEC' | 'TUT' | 'PRAC';
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  start: number; // minutes since midnight
  end: number;   // minutes since midnight
  room: string;
  capacity: number;
  term: 'Full semester' | 'First half' | 'Second half' | 'Both half';
  instructor: string;
}

export interface ScheduleData {
  schedule: ScheduleEntry[];
  roomCapacities: Record<string, number>;
}

export interface FreeRoom {
  room: string;
  capacity: number;
}

export interface SearchParams {
  day: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  term: string;
  componentFilter: string[];
}
