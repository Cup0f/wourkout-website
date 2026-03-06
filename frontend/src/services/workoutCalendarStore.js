const KEY = "gymworld.workoutCalendar.v1";

/*
  Mentett forma:
  {
    "2026-03-06": {
      date: "2026-03-06",
      workoutDayId: "abc123",
      note: ""
    }
  }
*/

function readAll() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
        return {};
    }
}

function writeAll(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}

export function getCalendarMap() {
    return readAll();
}

export function getCalendarEntry(dateKey) {
    const all = readAll();
    return all[dateKey] || null;
}

export function setCalendarEntry(dateKey, entry) {
    const all = readAll();
    all[dateKey] = {
        date: dateKey,
        workoutDayId: entry.workoutDayId ?? null,
        note: entry.note ?? "",
    };
    writeAll(all);
    return all[dateKey];
}

export function removeCalendarEntry(dateKey) {
    const all = readAll();
    delete all[dateKey];
    writeAll(all);
}