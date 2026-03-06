import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { listExercises, deleteExercise } from "../../services/exerciseStore.js";
import MuscleMapMini from "../../components/MuscleMapMini";

function countMuscles(m) {
    return (m?.primary?.length || 0) + (m?.secondary?.length || 0);
}

export default function ExerciseList() {
    const nav = useNavigate();
    const [q, setQ] = React.useState("");
    const [items, setItems] = React.useState(() => listExercises());

    const refresh = () => setItems(listExercises());

    const filtered = React.useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;
        return items.filter((x) => {
            const inName = x.name?.toLowerCase().includes(s);
            const inDesc = x.description?.toLowerCase().includes(s);
            return inName || inDesc;
        });
    }, [items, q]);

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-extrabold">Gyakorlatok</h2>

                <div className="flex gap-2">
                    <button
                        onClick={() => nav("/workouts/new")}
                        className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Új
                    </button>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Keresés név/leírás alapján…"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500 dark:text-slate-400">
                    Nincs találat.
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((x) => (
                        <div
                            key={x.id}
                            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden"
                        >
                            {x.imageDataUrl ? (
                                <>
                                    <img src={x.imageDataUrl} alt={x.name} className="h-40 w-full object-cover" />
                                    <div className="p-3">
                                        <MuscleMapMini muscles={x.muscles} view="front" />
                                    </div>
                                </>
                            ) : (
                                <div className="p-3">
                                    <MuscleMapMini muscles={x.muscles} view="front" />
                                </div>
                            )}

                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-extrabold">{x.name}</div>
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(x.createdAt).toLocaleString()}
                                            {" • "}
                                            Izmok: <span className="font-bold">{countMuscles(x.muscles)}</span>
                                        </div>
                                    </div>

                                    <NavLink
                                        to={`/workouts/${x.id}`}
                                        className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-white/5"
                                    >
                                        Megnyitás
                                    </NavLink>

                                    <NavLink
                                        to={`/workouts/${x.id}/edit`}
                                        className="rounded-xl bg-pink-700 px-3 py-2 text-xs font-extrabold text-white hover:bg-pink-800"
                                    >
                                        Szerkesztés
                                    </NavLink>
                                </div>

                                {x.description ? (
                                    <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                                        {x.description}
                                    </p>
                                ) : (
                                    <p className="mt-2 text-sm text-slate-400">Nincs leírás.</p>
                                )}

                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!confirm(`Törlöd: ${x.name}?`)) return;
                                            deleteExercise(x.id);
                                            refresh();
                                        }}
                                        className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-extrabold text-red-600 dark:text-red-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                    >
                                        Törlés
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}