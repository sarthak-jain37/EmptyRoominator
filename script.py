
import json
from datetime import datetime

with open("tt.json", "r") as f:
    tt = json.load(f)


day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
valid_blocks = {"A", "B", "C", "D", "G"}

opening_time = 8 * 60
closing_time = 20 * 60

phases = {
    "first_half": {"Full semester", "Both half", "First half"},
    "second_half": {"Full semester", "Both half", "Second half"}
}

timetable = {
    "first_half": {},
    "second_half": {}
}

seen_rowids = set()
seen_sessions = set()

rooms_with_non_practical = set()


def to_minutes(time):
    t = datetime.strptime(time, "%I:%M %p")
    return t.hour * 60 + t.minute


def get_block(room):
    return room[0]


def add_room(phase, block, room):
    timetable[phase].setdefault(block, {})
    timetable[phase][block].setdefault(room, {})


for dept in tt:
    for year in tt[dept]:
        for course in tt[dept][year]:

            room = course["room"].strip()

            if not room or room.lower() == "online":
                continue

            block = get_block(room)

            if block not in valid_blocks:
                continue

            term = course["term"].strip()

            matching_phases = [
                phase
                for phase, terms in phases.items()
                if term in terms
            ]

            if not matching_phases:
                raise ValueError(
                    f"Unknown term '{term}' for course "
                    f"{course['code']} in room {room}"
                )

            if course["comp"].strip().upper() != "PRAC":
                rooms_with_non_practical.add(room)

            rowid = course["rowid"]

            if rowid in seen_rowids:
                continue

            seen_rowids.add(rowid)

            code = course["code"]
            title = course["title"]
            day = course["day"]
            start = course["start"]
            end = course["end"]
            prof = course["inst"]

            key = (
                room,
                day,
                start,
                end,
                code,
                prof,
                course["type"],
                course["sec"],
                term
            )

            if key in seen_sessions:
                continue

            seen_sessions.add(key)

            session = {
                "code": code,
                "title": title,
                "start": start,
                "end": end,
                "prof": prof,
                "term": term
            }

            for phase in matching_phases:

                add_room(phase, block, room)

                timetable[phase][block][room].setdefault(day, [])
                timetable[phase][block][room][day].append(session)

for phase in timetable:

    for block in list(timetable[phase]):

        for room in list(timetable[phase][block]):

            if room not in rooms_with_non_practical:
                del timetable[phase][block][room]

        if not timetable[phase][block]:
            del timetable[phase][block]


for phase in timetable:

    for other_phase in timetable:

        if phase == other_phase:
            continue

        for block in timetable[other_phase]:

            for room in timetable[other_phase][block]:

                add_room(phase, block, room)


for phase in timetable:

    for block in timetable[phase]:

        for room in timetable[phase][block]:

            for day in day_order:
                timetable[phase][block][room].setdefault(day, [])

            for day in timetable[phase][block][room]:

                timetable[phase][block][room][day].sort(
                    key=lambda course: to_minutes(course["start"])
                )

            timetable[phase][block][room] = dict(
                sorted(
                    timetable[phase][block][room].items(),
                    key=lambda item: (
                        day_order.index(item[0])
                        if item[0] in day_order
                        else len(day_order)
                    )
                )
            )


for phase in timetable:

    for block in timetable[phase]:

        for room in timetable[phase][block]:

            for day in timetable[phase][block][room]:

                classes = timetable[phase][block][room][day]
                free_slots = []

                current_time = opening_time

                for course in classes:

                    start = min(
                        max(to_minutes(course["start"]), current_time),
                        closing_time
                    )

                    end = min(
                        max(to_minutes(course["end"]), current_time),
                        closing_time
                    )

                    if start > current_time:

                        free_slots.append({
                            "start": current_time,
                            "end": start,
                            "duration": start - current_time
                        })

                    current_time = max(current_time, end)

                # Add remaining free time
                if current_time < closing_time:

                    free_slots.append({
                        "start": current_time,
                        "end": closing_time,
                        "duration": closing_time - current_time
                    })

                timetable[phase][block][room][day] = {
                    "classes": classes,
                    "free_slots": free_slots
                }


with open("static/timetable.json", "w") as f:
    json.dump(timetable, f, indent=4)


print("Timetable preprocessing completed!")

for phase in timetable:

    total_rooms = sum(
        len(rooms) for rooms in timetable[phase].values()
    )

    print(f"{phase}: {total_rooms} rooms")

print(
    "Total eligible rooms:",
    len(rooms_with_non_practical)
)
