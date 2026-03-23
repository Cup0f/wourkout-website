import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getExercises, deleteExercise } from "../../api/exercisesApi";
import { LABELS } from "../../components/muscleMapData";
import MuscleMapMini from "../../components/MuscleMapMini";

export default function ExerciseList() {
    const navigate = useNavigate();

    const [q, setQ] = React.useState("");
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const loadExercises = React.useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getExercises();
            setItems(data);
        } catch (err) {
            setError(err.message || "Nem sikerült betölteni a gyakorlatokat.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadExercises();
    }, [loadExercises]);

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
                        onClick={() => navigate("/workouts/new")}
                        className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Új
                    </button>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Keresés név/leírás alapján…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                />
            </div>

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                    Betöltés...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                    Nincs találat.
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((x) => {
                        const primaryNames = (x.muscles?.primary ?? []).map((id) => LABELS[id] ?? id);
                        const secondaryNames = (x.muscles?.secondary ?? []).map((id) => LABELS[id] ?? id);

                        return (
                            <div
                                key={x.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
                            >
                                {x.imageUrl ? (
                                    <img
                                        src={x.imageUrl}
                                        alt={x.name}
                                        className="h-40 w-full object-cover bg-slate-50 dark:bg-slate-950"
                                    />
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
                                                {x.createdAt
                                                    ? new Date(x.createdAt).toLocaleString("hu-HU")
                                                    : ""}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <NavLink
                                                to={`/workouts/${x.id}`}
                                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
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
                                    </div>

                                    {x.description ? (
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                            {x.description}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-slate-400">Nincs leírás.</p>
                                    )}

                                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                                        <div className="font-bold text-red-600 dark:text-red-300">Fő:</div>
                                        <div>{primaryNames.join(", ") || "—"}</div>

                                        <div className="mt-2 font-bold text-amber-600 dark:text-amber-300">
                                            Segéd:
                                        </div>
                                        <div>{secondaryNames.join(", ") || "—"}</div>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!confirm(`Törlöd: ${x.name}?`)) return;

                                                try {
                                                    await deleteExercise(x.id);
                                                    await loadExercises();
                                                } catch (err) {
                                                    alert(err.message || "Nem sikerült törölni a gyakorlatot.");
                                                }
                                            }}
                                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 dark:border-red-500/25 dark:text-red-300 dark:hover:bg-red-500/10"
                                        >
                                            Törlés
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}