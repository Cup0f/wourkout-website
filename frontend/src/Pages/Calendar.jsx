import React from "react";
import { NavLink } from "react-router-dom";
import { listWorkoutDays } from "../services/workoutDayStore";
import {
    getCalendarMap,
    setCalendarEntry,
    removeCalendarEntry,
} from "../services/workoutCalendarStore";

function getWorkoutStatus(workoutDay) {
    if (!workoutDay?.exercises?.length) return "none";

    const statuses = workoutDay.exercises.map((e) => e.status);

    if (statuses.every((s) => s === "done")) return "done";
    if (statuses.includes("in_progress")) return "in_progress";
    if (statuses.includes("todo")) return "todo";

    return "none";
}

function getStatusColor(status) {
    switch (status) {
        case "done":
            return "bg-emerald-100 border-emerald-300 dark:bg-emerald-500/15";
        case "in_progress":
            return "bg-amber-100 border-amber-300 dark:bg-amber-500/15";
        case "todo":
            return "bg-sky-100 border-sky-300 dark:bg-sky-500/15";
        default:
            return "";
    }
}

function pad(n) {
    return String(n).padStart(2, "0");
}

function toDateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isSameMonth(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth()
    );
}

function isToday(date) {
    const now = new Date();
    return (
        now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate()
    );
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeekMonday(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 vasárnap
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function endOfWeekSunday(date) {
    const start = startOfWeekMonday(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
}

function addDays(date, amount) {
    const d = new Date(date);
    d.setDate(d.getDate() + amount);
    return d;
}

function buildCalendarDays(currentMonth) {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const gridStart = startOfWeekMonday(monthStart);
    const gridEnd = endOfWeekSunday(monthEnd);

    const days = [];
    let cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
        days.push(new Date(cursor));
        cursor = addDays(cursor, 1);
    }

    return days;
}

const WEEK_LABELS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = React.useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const [workoutDays, setWorkoutDays] = React.useState([]);
    const [calendarMap, setCalendarMapState] = React.useState({});
    const [selectedDateKey, setSelectedDateKey] = React.useState(null);

    React.useEffect(() => {
        setWorkoutDays(listWorkoutDays());
        setCalendarMapState(getCalendarMap());
    }, []);

    const refreshCalendar = React.useCallback(() => {
        setCalendarMapState(getCalendarMap());
        setWorkoutDays(listWorkoutDays());
    }, []);

    const days = React.useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

    const selectedEntry = selectedDateKey ? calendarMap[selectedDateKey] : null;

    const monthTitle = currentMonth.toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "long",
    });

    const assignWorkoutDay = (dateKey, workoutDayId) => {
        setCalendarEntry(dateKey, { workoutDayId });
        refreshCalendar();
    };

    const clearDate = (dateKey) => {
        removeCalendarEntry(dateKey);
        refreshCalendar();
    };

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">Edzés naptár</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Rendelj edzésnapokat konkrét dátumokhoz.
                    </p>
                </div>

                <div className="flex gap-2">
                    <NavLink
                        to="/workouts/days"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Edzésnapok
                    </NavLink>

                    <NavLink
                        to="/workouts/days/new"
                        className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Új edzésnap
                    </NavLink>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                {/* BAL: naptár */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                                )
                            }
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                            Előző
                        </button>

                        <div className="text-lg font-extrabold capitalize">{monthTitle}</div>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                                )
                            }
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                            Következő
                        </button>
                    </div>

                    {/* Fejléc */}
                    <div className="mb-2 grid grid-cols-7 gap-2">
                        {WEEK_LABELS.map((label) => (
                            <div
                                key={label}
                                className="rounded-xl bg-slate-50 px-2 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400"
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Napok */}
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((date) => {
                            const dateKey = toDateKey(date);
                            const entry = calendarMap[dateKey];
                            const assignedDay = entry
                                ? workoutDays.find((x) => x.id === entry.workoutDayId)
                                : null;

                            const workoutStatus = assignedDay
                                ? getWorkoutStatus(assignedDay)
                                : "none";

                            const statusColor = getStatusColor(workoutStatus);

                            const inCurrentMonth = isSameMonth(date, currentMonth);
                            const today = isToday(date);
                            const selected = selectedDateKey === dateKey;

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    onClick={() => setSelectedDateKey(dateKey)}
                                    className={[
                                        "min-h-28 rounded-2xl border p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-950",
                                        inCurrentMonth
                                            ? assignedDay
                                                ? statusColor
                                                : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
                                            : "border-slate-100 bg-slate-50 text-slate-400 dark:border-white/5 dark:bg-slate-950/60 dark:text-slate-500",
                                        selected ? "ring-2 ring-sky-500/50" : "",
                                    ].join(" ")}
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                        className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold",
                            today
                                ? "bg-pink-700 text-white"
                                : "bg-transparent text-inherit",
                        ].join(" ")}
                    >
                      {date.getDate()}
                    </span>
                                    </div>

                                    {assignedDay ? (
                                        <div className="space-y-2">
                                            <div className="rounded-xl bg-pink-100 px-2 py-1 text-xs font-extrabold text-pink-800 dark:bg-pink-500/15 dark:text-pink-300">
                                                Edzésnap
                                            </div>

                                            <div className="line-clamp-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {assignedDay.name}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 dark:text-slate-500">
                                            Nincs edzésnap
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* JOBB: kiválasztott nap */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-3 text-lg font-extrabold">Kiválasztott nap</div>

                        {selectedDateKey ? (
                            <>
                                <div className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                                    Dátum:{" "}
                                    <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(selectedDateKey).toLocaleDateString("hu-HU")}
                  </span>
                                </div>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-bold">Edzésnap kiválasztása</span>
                                    <select
                                        value={selectedEntry?.workoutDayId ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (!value) {
                                                clearDate(selectedDateKey);
                                                return;
                                            }
                                            assignWorkoutDay(selectedDateKey, value);
                                        }}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                                    >
                                        <option value="">Nincs kiválasztva</option>
                                        {workoutDays.map((day) => (
                                            <option key={day.id} value={day.id}>
                                                {day.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {selectedEntry?.workoutDayId ? (
                                    <div className="mt-4 space-y-2">
                                        {(() => {
                                            const selectedWorkout = workoutDays.find(
                                                (x) => x.id === selectedEntry.workoutDayId
                                            );

                                            if (!selectedWorkout) {
                                                return (
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                                        A hozzárendelt edzésnap már nem létezik.
                                                    </div>
                                                );
                                            }

                                            return (
                                                <>
                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
                                                        <div className="font-extrabold">{selectedWorkout.name}</div>
                                                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                            {selectedWorkout.description || "Nincs leírás."}
                                                        </div>
                                                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                                            Gyakorlatok száma: {selectedWorkout.exercises?.length ?? 0}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <NavLink
                                                            to={`/workouts/days/${selectedWorkout.id}`}
                                                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                                                        >
                                                            Megnyitás
                                                        </NavLink>

                                                        <button
                                                            type="button"
                                                            onClick={() => clearDate(selectedDateKey)}
                                                            className="rounded-xl border border-red-200 px-3 py-2 text-sm font-extrabold text-red-700 hover:bg-red-50 dark:border-red-500/25 dark:text-red-300 dark:hover:bg-red-500/10"
                                                        >
                                                            Törlés erről a napról
                                                        </button>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                        Ehhez a naphoz még nincs edzésnap hozzárendelve.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Kattints egy napra a naptárban.
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-2 text-sm font-extrabold">Tipp</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                            Így könnyen be tudod osztani előre a heteidet. Később ide jöhet majd több
                            edzésnap egy napra, jegyzet, vagy teljesítési napló is.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}