import React from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getWorkoutDay, updateWorkoutDay, deleteWorkoutDay } from "../../services/workoutDayStore";
import { getExercise } from "../../services/exerciseStore";
import { LABELS } from "../../components/muscleMapData";

const STATUS_OPTIONS = [
    { value: "todo", label: "Elvégzendő" },
    { value: "in_progress", label: "Folyamatban" },
    { value: "done", label: "Befejezve" },
];

function statusLabel(status) {
    return STATUS_OPTIONS.find((x) => x.value === status)?.label ?? status;
}

function statusClasses(status) {
    switch (status) {
        case "done":
            return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25";
        case "in_progress":
            return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-white/10";
    }
}

function muscleNames(muscles = {}) {
    const primary = (muscles.primary ?? []).map((id) => LABELS[id] ?? id);
    const secondary = (muscles.secondary ?? []).map((id) => LABELS[id] ?? id);
    return { primary, secondary };
}

export default function WorkoutDayView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loaded, setLoaded] = React.useState(false);
    const [day, setDay] = React.useState(null);

    React.useEffect(() => {
        const data = getWorkoutDay(id);
        setDay(data);
        setLoaded(true);
    }, [id]);

    const refreshDay = React.useCallback(() => {
        const data = getWorkoutDay(id);
        setDay(data);
    }, [id]);

    const updateExerciseStatus = (itemId, nextStatus) => {
        if (!day) return;

        const nextExercises = day.exercises.map((item) =>
            item.id === itemId ? { ...item, status: nextStatus } : item
        );

        updateWorkoutDay(day.id, {
            exercises: nextExercises,
        });

        refreshDay();
    };

    const markAll = (status) => {
        if (!day) return;

        const nextExercises = day.exercises.map((item) => ({
            ...item,
            status,
        }));

        updateWorkoutDay(day.id, {
            exercises: nextExercises,
        });

        refreshDay();
    };

    if (!loaded) {
        return <div className="p-4 text-slate-900 dark:text-white">Betöltés…</div>;
    }

    if (!day) {
        return (
            <div className="p-4 text-slate-900 dark:text-white">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900">
                    <div className="text-lg font-extrabold">Nem találom ezt az edzésnapot.</div>

                    <div className="mt-4">
                        <button
                            onClick={() => navigate("/workouts/days")}
                            className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                        >
                            Vissza az edzésnapokhoz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const orderedItems = [...(day.exercises ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const detailedItems = orderedItems.map((item) => {
        const exercise = getExercise(item.exerciseId);
        return {
            ...item,
            exercise,
        };
    });

    const total = detailedItems.length;
    const doneCount = detailedItems.filter((x) => x.status === "done").length;
    const progressCount = detailedItems.filter((x) => x.status === "in_progress").length;
    const todoCount = detailedItems.filter((x) => x.status === "todo").length;
    const completionPercent = total ? Math.round((doneCount / total) * 100) : 0;

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">{day.name}</h1>

                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Létrehozva: {new Date(day.createdAt).toLocaleString()}
                    </div>

                    {day.description ? (
                        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {day.description}
                        </p>
                    ) : (
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                            Nincs megadva leírás.
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <NavLink
                        to="/workouts/days"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Edzésnapok
                    </NavLink>

                    <NavLink
                        to={`/workouts/days/${day.id}/edit`}
                        className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Szerkesztés
                    </NavLink>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Összes gyakorlat" value={String(total)} />
                <StatCard label="Elvégzendő" value={String(todoCount)} tone="todo" />
                <StatCard label="Folyamatban" value={String(progressCount)} tone="progress" />
                <StatCard label="Befejezve" value={`${doneCount} (${completionPercent}%)`} tone="done" />
            </div>

            {/* Quick actions */}
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <div className="mb-3 text-sm font-extrabold">Gyors műveletek</div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => markAll("todo")}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Mind elvégzendő
                    </button>

                    <button
                        type="button"
                        onClick={() => markAll("in_progress")}
                        className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-extrabold text-amber-700 hover:bg-amber-50 dark:border-amber-500/25 dark:text-amber-300 dark:hover:bg-amber-500/10"
                    >
                        Mind folyamatban
                    </button>

                    <button
                        type="button"
                        onClick={() => markAll("done")}
                        className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-extrabold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/25 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                    >
                        Mind befejezve
                    </button>
                </div>
            </div>

            {/* Exercise cards */}
            {!detailedItems.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                    Ez az edzésnap még nem tartalmaz gyakorlatot.
                </div>
            ) : (
                <div className="space-y-4">
                    {detailedItems.map((item, index) => {
                        const ex = item.exercise;
                        const names = muscleNames(ex?.muscles);

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    {/* Left */}
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                        #{index + 1}
                      </span>

                                            <span
                                                className={[
                                                    "rounded-full border px-2.5 py-1 text-xs font-extrabold",
                                                    statusClasses(item.status),
                                                ].join(" ")}
                                            >
                        {statusLabel(item.status)}
                      </span>
                                        </div>

                                        <div className="text-lg font-extrabold">
                                            {ex?.name ?? "Ismeretlen gyakorlat"}
                                        </div>

                                        <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                                            {ex?.description || "Nincs leírás."}
                                        </div>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
                                                <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-red-600 dark:text-red-300">
                                                    Fő izmok
                                                </div>

                                                {names.primary.length ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {names.primary.map((name) => (
                                                            <span
                                                                key={name}
                                                                className="rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-200"
                                                            >
                                {name}
                              </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">—</div>
                                                )}
                                            </div>

                                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
                                                <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-300">
                                                    Segéd izmok
                                                </div>

                                                {names.secondary.length ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {names.secondary.map((name) => (
                                                            <span
                                                                key={name}
                                                                className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-200"
                                                            >
                                {name}
                              </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">—</div>
                                                )}
                                            </div>
                                        </div>

                                        {ex?.imageDataUrl ? (
                                            <div className="mt-4">
                                                <img
                                                    src={ex.imageDataUrl}
                                                    alt={ex.name}
                                                    className="max-h-60 rounded-xl border border-slate-200 object-cover dark:border-white/10"
                                                />
                                            </div>
                                        ) : null}
                                    </div>

                                    {/* Right */}
                                    <div className="w-full shrink-0 lg:w-[220px]">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
                                            <div className="mb-2 text-sm font-extrabold">Státusz</div>

                                            <select
                                                value={item.status}
                                                onChange={(e) => updateExerciseStatus(item.id, e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-900"
                                            >
                                                <option value="todo">Elvégzendő</option>
                                                <option value="in_progress">Folyamatban</option>
                                                <option value="done">Befejezve</option>
                                            </select>

                                            {ex?.id ? (
                                                <div className="mt-3">
                                                    <NavLink
                                                        to={`/workouts/${ex.id}`}
                                                        className="inline-flex rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                                                    >
                                                        Gyakorlat megnyitása
                                                    </NavLink>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Danger zone */}
            <div className="mt-6 rounded-2xl border border-red-200 bg-white p-4 dark:border-red-500/25 dark:bg-slate-900">
                <div className="mb-2 text-sm font-extrabold text-red-700 dark:text-red-200">
                    Veszélyes művelet
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (!confirm(`Biztosan törlöd ezt az edzésnapot? (${day.name})`)) return;
                        deleteWorkoutDay(day.id);
                        navigate("/workouts/days");
                    }}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 hover:bg-red-50 dark:border-red-500/25 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                    Edzésnap törlése
                </button>
            </div>
        </div>
    );
}

function StatCard({ label, value, tone = "default" }) {
    const toneClass =
        tone === "done"
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10"
            : tone === "progress"
                ? "border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10"
                : tone === "todo"
                    ? "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-500/10"
                    : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900";

    return (
        <div className={`rounded-2xl border p-4 ${toneClass}`}>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-extrabold">{value}</div>
        </div>
    );
}