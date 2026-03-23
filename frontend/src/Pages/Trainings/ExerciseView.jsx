import React from "react";
import {NavLink, useNavigate, useParams} from "react-router-dom";
import {getExerciseById, deleteExercise} from "../../api/exercisesApi";
import {LABELS} from "../../components/muscleMapData";
import MuscleMapMini from "../../components/MuscleMapMini";

function labelize(ids = []) {
    return ids.map((id) => LABELS[id] ?? id);
}

export default function ExerciseView() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [exercise, setExercise] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [deleting, setDeleting] = React.useState(false);

    const loadExercise = React.useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError("");

        try {
            const data = await getExerciseById(id);
            setExercise(data);
        } catch (err) {
            setError(err.message || "Nem sikerült betölteni a gyakorlatot.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        loadExercise();
    }, [loadExercise]);

    if (loading) {
        return (
            <div className="p-4 text-slate-900 dark:text-white">
                <div
                    className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                    Betöltés...
                </div>
            </div>
        );
    }

    if (error || !exercise) {
        return (
            <div className="p-4 text-slate-900 dark:text-white">
                <div
                    className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/25 dark:bg-red-500/10">
                    <div className="text-lg font-extrabold text-red-700 dark:text-red-300">
                        Nem találom ezt a gyakorlatot.
                    </div>

                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        {error || "A kért gyakorlat nem érhető el."}
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => navigate("/workouts")}
                            className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                        >
                            Vissza a listára
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const primary = labelize(exercise.muscles?.primary ?? []);
    const secondary = labelize(exercise.muscles?.secondary ?? []);

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">{exercise.name}</h1>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Létrehozva:{" "}
                        {exercise.createdAt
                            ? new Date(exercise.createdAt).toLocaleString("hu-HU")
                            : "—"}
                        {" • "}
                        Módosítva:{" "}
                        {exercise.updatedAt
                            ? new Date(exercise.updatedAt).toLocaleString("hu-HU")
                            : "—"}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <NavLink
                        to="/workouts"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Lista
                    </NavLink>

                    <NavLink
                        to={`/workouts/${exercise.id}/edit`}
                        className="rounded-xl bg-pink-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-pink-800"
                    >
                        Szerkesztés
                    </NavLink>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Left */}
                <div className="space-y-4 lg:col-span-1">
                    <div
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
                        {exercise.imageUrl ? (
                            <img
                                src={exercise.imageUrl}
                                alt={exercise.name}
                                className="max-h-[420px] w-full object-cover"
                            />
                        ) : (
                            <div className="p-4">
                                <MuscleMapMini muscles={exercise.muscles} view="front"/>
                            </div>
                        )}
                    </div>

                    <div
                        className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-2 text-sm font-extrabold">Izmok (vizuálisan)</div>
                        <div className="grid grid-cols-2 gap-2">
                            <MuscleMapMini muscles={exercise.muscles} view="front"/>
                            <MuscleMapMini muscles={exercise.muscles} view="back"/>
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="space-y-4 lg:col-span-2">
                    <div
                        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-2 text-base font-extrabold">Leírás</div>

                        {exercise.description ? (
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200">
                                {exercise.description}
                            </p>
                        ) : (
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Nincs megadva leírás.
                            </div>
                        )}
                    </div>

                    <div
                        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-3 text-base font-extrabold">Izmok</div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
                                <div className="mb-2 text-sm font-extrabold text-red-600 dark:text-red-300">
                                    Fő izmok
                                </div>

                                {primary.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {primary.map((name) => (
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

                            <div
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950">
                                <div className="mb-2 text-sm font-extrabold text-amber-600 dark:text-amber-300">
                                    Segéd izmok
                                </div>

                                {secondary.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {secondary.map((name) => (
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
                    </div>

                    <div
                        className="rounded-2xl border border-red-200 bg-white p-5 dark:border-red-500/25 dark:bg-slate-900">
                        <div className="mb-2 text-base font-extrabold text-red-700 dark:text-red-200">
                            Műveletek
                        </div>

                        <button
                            type="button"
                            disabled={deleting}
                            onClick={async () => {
                                if (!confirm(`Biztosan törlöd? (${exercise.name})`)) return;

                                setDeleting(true);
                                try {
                                    await deleteExercise(exercise.id);
                                    navigate("/workouts");
                                } catch (err) {
                                    alert(err.message || "Nem sikerült törölni a gyakorlatot.");
                                } finally {
                                    setDeleting(false);
                                }
                            }}
                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/25 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                            {deleting ? "Törlés..." : "Törlés"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}