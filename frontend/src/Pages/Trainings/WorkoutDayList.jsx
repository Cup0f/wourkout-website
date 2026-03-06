import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { listWorkoutDays, deleteWorkoutDay } from "../../services/workoutDayStore";

function getStatusStats(exercises = []) {
    return exercises.reduce(
        (acc, item) => {
            if (item.status === "done") acc.done += 1;
            else if (item.status === "in_progress") acc.inProgress += 1;
            else acc.todo += 1;
            return acc;
        },
        { todo: 0, inProgress: 0, done: 0 }
    );
}

export default function WorkoutDayList() {
    const navigate = useNavigate();
    const [query, setQuery] = React.useState("");
    const [items, setItems] = React.useState(() => listWorkoutDays());

    const refresh = React.useCallback(() => {
        setItems(listWorkoutDays());
    }, []);

    const filteredItems = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;

        return items.filter((item) => {
            const inName = item.name?.toLowerCase().includes(q);
            const inDescription = item.description?.toLowerCase().includes(q);
            return inName || inDescription;
        });
    }, [items, query]);

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">Edzésnapok</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Itt látod az összes elmentett edzésnapot.
                    </p>
                </div>

                <div className="flex gap-2">
                    <NavLink
                        to="/workouts"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Gyakorlatok
                    </NavLink>

                    <button
                        type="button"
                        onClick={() => navigate("/workouts/days/new")}
                        className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Új edzésnap
                    </button>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Keresés név vagy leírás alapján..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                />
            </div>

            {!filteredItems.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                    Nincs elmentett edzésnap.
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredItems.map((item) => {
                        const stats = getStatusStats(item.exercises);
                        const total = item.exercises?.length ?? 0;
                        const progressPercent = total ? Math.round((stats.done / total) * 100) : 0;

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-lg font-extrabold">{item.name}</div>
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                    {total} gyakorlat
                  </span>
                                </div>

                                <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                                    {item.description || "Nincs leírás."}
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                            <span>Haladás</span>
                                            <span>{progressPercent}%</span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <StatusMiniCard label="Elvégzendő" value={stats.todo} tone="todo" />
                                        <StatusMiniCard label="Folyamatban" value={stats.inProgress} tone="progress" />
                                        <StatusMiniCard label="Befejezve" value={stats.done} tone="done" />
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <NavLink
                                        to={`/workouts/days/${item.id}`}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                                    >
                                        Megnyitás
                                    </NavLink>

                                    <NavLink
                                        to={`/workouts/days/${item.id}/edit`}
                                        className="rounded-xl bg-pink-700 px-3 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                                    >
                                        Szerkesztés
                                    </NavLink>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!confirm(`Biztosan törlöd ezt az edzésnapot? (${item.name})`)) return;
                                            deleteWorkoutDay(item.id);
                                            refresh();
                                        }}
                                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-extrabold text-red-700 hover:bg-red-50 dark:border-red-500/25 dark:text-red-300 dark:hover:bg-red-500/10"
                                    >
                                        Törlés
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StatusMiniCard({ label, value, tone = "todo" }) {
    const toneClasses =
        tone === "done"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
            : tone === "progress"
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300"
                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-slate-500/10 dark:text-slate-300";

    return (
        <div className={`rounded-xl border p-3 ${toneClasses}`}>
            <div className="text-[11px] font-bold uppercase tracking-wide">{label}</div>
            <div className="mt-1 text-lg font-extrabold">{value}</div>
        </div>
    );
}