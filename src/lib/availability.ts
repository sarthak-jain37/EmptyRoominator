import type { TimetableData, RoomAvailabilityResult, DaySchedule, FreeSlot } from "./types";
import { OPERATING_START, OPERATING_END, formatMinutesTo12Hour } from "./time";

export const DEFAULT_PARTIAL_THRESHOLD = 15; // 15 minutes minimum continuous availability

/**
 * Gets day schedule for a given room.
 * If a room exists in the timetable but has no classes on that day,
 * it is treated as free for the entire 8 AM - 8 PM operating window.
 */
export function getRoomDaySchedule(
  timetable: TimetableData,
  block: string,
  room: string,
  day: string
): DaySchedule {
  if (timetable[block] && timetable[block][room] && timetable[block][room][day]) {
    return timetable[block][room][day];
  }
  // Otherwise empty day: completely free from 8 AM to 8 PM
  return {
    classes: [],
    free_slots: [
      {
        start: OPERATING_START,
        end: OPERATING_END,
        duration: OPERATING_END - OPERATING_START
      }
    ]
  };
}

/**
 * Checks a single room's availability for a requested time range [reqStart, reqEnd].
 *
 * Rules:
 * 1. Full availability: One continuous free interval contains the entire requested duration.
 *    (slot.start <= reqStart && slot.end >= reqEnd)
 * 2. Partial availability: Free at reqStart, but becomes occupied before reqEnd.
 *    Only count continuous availability beginning at reqStart. (slot.start <= reqStart && slot.end > reqStart)
 *    Duration = slot.end - reqStart.
 *    Must be >= partialThreshold.
 * 3. Never combine separate free intervals.
 */
export function evaluateRoomAvailability(
  freeSlots: FreeSlot[],
  reqStart: number,
  reqEnd: number,
  room: string,
  block: string,
  partialThreshold: number = DEFAULT_PARTIAL_THRESHOLD
): RoomAvailabilityResult | null {
  // Find continuous slot containing reqStart
  for (const slot of freeSlots) {
    if (slot.start <= reqStart && slot.end > reqStart) {
      // Free at start time
      if (slot.end >= reqEnd) {
        // Fully available for the requested duration
        return {
          room,
          block,
          status: "full",
          durationAvailable: reqEnd - reqStart,
          freeStart: slot.start,
          freeEnd: slot.end
        };
      } else {
        // Partially available: ends at slot.end (< reqEnd)
        const continuousAvailable = slot.end - reqStart;
        if (continuousAvailable >= partialThreshold) {
          return {
            room,
            block,
            status: "partial",
            durationAvailable: continuousAvailable,
            freeStart: reqStart,
            freeEnd: slot.end,
            nextClassStart: formatMinutesTo12Hour(slot.end)
          };
        }
      }
    }
  }

  return null;
}

/**
 * Searches rooms across the timetable based on block, day, and time interval.
 * Returns sorted results:
 * 1. Fully available rooms first.
 * 2. Partially available rooms afterward, sorted by longest available duration.
 */
export function searchAvailableRooms(
  timetable: TimetableData,
  selectedBlock: string, // "ALL" or specific block name like "A"
  day: string,
  reqStart: number,
  reqEnd: number,
  partialThreshold: number = DEFAULT_PARTIAL_THRESHOLD,
  sortBy: "longest" | "room" = "longest"
): RoomAvailabilityResult[] {
  const results: RoomAvailabilityResult[] = [];

  const blocksToSearch =
    selectedBlock === "ALL" || !selectedBlock
      ? Object.keys(timetable).sort()
      : [selectedBlock];

  for (const block of blocksToSearch) {
    const roomsInBlock = timetable[block] || {};
    const roomNames = Object.keys(roomsInBlock).sort();

    for (const room of roomNames) {
      const daySchedule = getRoomDaySchedule(timetable, block, room, day);
      const res = evaluateRoomAvailability(
        daySchedule.free_slots,
        reqStart,
        reqEnd,
        room,
        block,
        partialThreshold
      );

      if (res) {
        results.push(res);
      }
    }
  }

  // Sort results
  results.sort((a, b) => {
    // 1. Fully available first, then partial
    if (a.status !== b.status) {
      return a.status === "full" ? -1 : 1;
    }

    if (sortBy === "room") {
      return a.room.localeCompare(b.room, undefined, { numeric: true });
    }

    // Default "longest"
    if (a.status === "partial" && b.status === "partial") {
      // Partial sorted by longest available duration desc
      if (b.durationAvailable !== a.durationAvailable) {
        return b.durationAvailable - a.durationAvailable;
      }
    }

    // Secondary sort: block, then room
    if (a.block !== b.block) {
      return a.block.localeCompare(b.block);
    }
    return a.room.localeCompare(b.room, undefined, { numeric: true });
  });

  return results;
}

