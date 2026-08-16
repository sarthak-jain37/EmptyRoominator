import type { ScheduleEntry, ScheduleData, FreeRoom } from './types';

/**
 * Convert "HH:MM" string to minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to "HH:MM" string.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Check if two time intervals overlap.
 * An interval [a, b] overlaps [c, d] if a < d AND b > c (strict — touching edges are NOT overlapping).
 * A class running 09:00-10:00 does not block a query for 10:00-11:00.
 */
function intervalsOverlap(
  aStart: number, aEnd: number,
  bStart: number, bEnd: number
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Given time queries per day and a term, return all rooms that:
 *   1. Have NO bookings (any component type) overlapping the query windows.
 *   2. Are used as a room for at least one of the selected component types
 *      (componentFilter controls what TYPE of room to show, not what conflicts).
 *
 * Term logic:
 *   - "Full semester" / "Both half" courses run all semester → always block.
 *   - "First half" / "Second half" courses block only in their period.
 *   - "Any" → treat all entries as blockers (most conservative).
 */
export type TimeQuery = { day: string; start: number; end: number };

export function findFreeRooms(
  data: ScheduleData,
  queries: TimeQuery[],
  termFilter: string,       // 'Any' | 'Full semester' | 'First half' | 'Second half' | 'Both half'
  componentFilter: string[] // e.g. ['LEC', 'TUT', 'PRAC'] — which room TYPES to show
): FreeRoom[] {
  if (queries.length === 0) return [];

  const isRelevantTerm = (entryTerm: string): boolean => {
    if (termFilter === 'Any') return true;
    if (entryTerm === 'Full semester' || entryTerm === 'Both half') return true;
    return entryTerm === termFilter;
  };

  // Conflict check: always check ALL component types so we don't miss any booking
  const busyRooms = new Set<string>();
  for (const entry of data.schedule) {
    if (!isRelevantTerm(entry.term)) continue;
    for (const q of queries) {
      if (entry.day === q.day && intervalsOverlap(entry.start, entry.end, q.start, q.end)) {
        busyRooms.add(entry.room);
        break;
      }
    }
  }

  // Build set of rooms that are ever used for the selected component types
  const roomsByComponent = new Set<string>();
  if (componentFilter.length > 0) {
    for (const entry of data.schedule) {
      if (componentFilter.includes(entry.component)) {
        roomsByComponent.add(entry.room);
      }
    }
  }

  const freeRooms: FreeRoom[] = [];
  for (const [room, capacity] of Object.entries(data.roomCapacities)) {
    if (busyRooms.has(room)) continue;
    // Only include rooms that match the selected component type(s)
    if (componentFilter.length > 0 && !roomsByComponent.has(room)) continue;
    freeRooms.push({ room, capacity });
  }

  freeRooms.sort((a, b) => {
    if (b.capacity !== a.capacity) return b.capacity - a.capacity;
    return a.room.localeCompare(b.room);
  });

  return freeRooms;
}

/**
 * For a given room and day, returns which time slots it is occupied,
 * useful for the room detail view.
 */
export function getRoomSchedule(
  data: ScheduleData,
  room: string,
  days: string[]
): ScheduleEntry[] {
  const dayOrder: Record<string, number> = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
  return data.schedule
    .filter(e => e.room === room && days.includes(e.day))
    .sort((a, b) => {
      if (a.day !== b.day) return (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0);
      return a.start - b.start;
    });
}
