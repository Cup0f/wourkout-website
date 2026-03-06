const KEY = "gymworld.exercises.v1";

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

export function listExercises() {
    const items = readAll();
    // newest first
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getExercise(id) {
    return readAll().find((x) => x.id === id) || null;
}

export function createExercise(ex) {
    const items = readAll();
    items.push(ex);
    writeAll(items);
    return ex;
}

export function updateExercise(id, patch) {
    const items = readAll();
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) return null;

    items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAll(items);
    return items[idx];
}

export function deleteExercise(id) {
    const items = readAll().filter((x) => x.id !== id);
    writeAll(items);
}