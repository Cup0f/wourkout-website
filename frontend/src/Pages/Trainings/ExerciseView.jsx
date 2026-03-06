import React from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getExercise, deleteExercise } from "../../services/exerciseStore";
import { LABELS } from "../../components/muscleMapData";
import MuscleMapMini from "../../components/MuscleMapMini";

function labelize(arr) {
    return Array.isArray(arr) ? arr : [];
}

export default function ExerciseView() {
    const { id } = useParams();
    const nav = useNavigate();

    const [ex, setEx] = React.useState(null);
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        const data = getExercise(id);
        setEx(data);
        setLoaded(true);
    }, [id]);

    if (!loaded) {
        return <div className="p-4 text-slate-900 dark:text-white">Betöltés…</div>;
    }

    if (!ex) {
        return (
            <div className="p-4 text-slate-900 dark:text-white">
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6">
                    <div className="text-lg font-extrabold">Nem találom ezt az edzést/gyakorlatot.</div>
                    <button
                        onClick={() => nav("/workouts")}
                        className="mt-4 rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Vissza a listára
                    </button>
                </div>
            </div>
        );
    }

    const primary = labelize(ex.muscles?.primary);
    const secondary = labelize(ex.muscles?.secondary);

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">{ex.name}</h1>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Létrehozva: {new Date(ex.createdAt).toLocaleString()} • Módosítva:{" "}
                        {new Date(ex.updatedAt).toLocaleString()}
                    </div>
                </div>

                <div className="flex gap-2">
                    <NavLink
                        to="/workouts"
                        className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        Lista
                    </NavLink>

                    <NavLink
                        to={`/workouts/${ex.id}/edit`}
                        className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Szerkesztés
                    </NavLink>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Left: kép */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden">
                        {ex.imageDataUrl ? (
                            <img
                                src={ex.imageDataUrl}
                                alt={ex.name}
                                className="w-full object-cover max-h-105"
                            />
                        ) : (
                            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                                Nincs feltöltött kép.
                            </div>
                        )}
                    </div>

                    {/*Mini izomtérkép */}
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4">
                    <div className="text-sm font-extrabold mb-2">Izmok (vizuálisan)</div>
                    <div className="grid grid-cols-2 gap-2">
                      <MuscleMapMini muscles={ex.muscles} view="front" />
                      <MuscleMapMini muscles={ex.muscles} view="back" />
                    </div>
                  </div>
                </div>

                {/* Right: részletek */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5">
                        <div className="text-base font-extrabold mb-2">Leírás</div>
                        {ex.description ? (
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200">
                                {ex.description}
                            </p>
                        ) : (
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Nincs megadva leírás.
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5">
                        <div className="text-base font-extrabold mb-3">Izmok</div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 p-4">
                                <div className="text-sm font-extrabold text-red-600 dark:text-red-300 mb-2">
                                    Fő izmok
                                </div>
                                
                                {primary.length ? (
                                    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">
                                        {primary.map((m) => (
                                            <li key={m}>{LABELS[m] ?? m}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-slate-500 dark:text-slate-400">—</div>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 p-4">
                                <div className="text-sm font-extrabold text-amber-600 dark:text-amber-300 mb-2">
                                    Segéd izmok
                                </div>

                                {secondary.length ? (
                                    <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200">
                                        {secondary.map((m) => (
                                            <li key={m}>{LABELS[m] ?? m}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-sm text-slate-500 dark:text-slate-400">—</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Danger zone */}
                    <div className="rounded-2xl border border-red-200 dark:border-red-500/25 bg-white dark:bg-slate-900 p-5">
                        <div className="text-base font-extrabold mb-2 text-red-700 dark:text-red-200">
                            Műveletek
                        </div>

                        <button
                            onClick={() => {
                                if (!confirm(`Biztosan törlöd? (${ex.name})`)) return;
                                deleteExercise(ex.id);
                                nav("/workouts");
                            }}
                            className="rounded-xl border border-red-200 dark:border-red-500/25 px-4 py-2 text-sm font-extrabold text-red-700 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                            Törlés
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}