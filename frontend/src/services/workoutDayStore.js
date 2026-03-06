const KEY = "gymworld.workoutDays.v1";

function readAll() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
        return [];
    }
}

function writeAll(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
}

export function listWorkoutDays() {
    return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getWorkoutDay(id) {
    return readAll().find((x) => x.id === id) || null;
}

export function createWorkoutDay(item) {
    const items = readAll();
    items.push(item);
    writeAll(items);
    return item;
}

export function updateWorkoutDay(id, patch) {
    const items = readAll();
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) return null;

    items[idx] = {
        ...items[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
    };

    writeAll(items);
    return items[idx];
}

export function deleteWorkoutDay(id) {
    const items = readAll().filter((x) => x.id !== id);
    writeAll(items);
}