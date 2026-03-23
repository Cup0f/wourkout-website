import React from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import MuscleMapPicker from "../../components/MuscleMapPicker";
import { getExerciseById, updateExercise } from "../../api/exercisesApi";

const EMPTY_MUSCLES = { primary: [], secondary: [] };

export default function ExerciseEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState("");

    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [imageUrl, setImageUrl] = React.useState("");
    const [muscles, setMuscles] = React.useState(EMPTY_MUSCLES);

    const loadExercise = React.useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError("");

        try {
            const data = await getExerciseById(id);
            setName(data.name ?? "");
            setDescription(data.description ?? "");
            setImageUrl(data.imageUrl ?? "");
            setMuscles(data.muscles ?? EMPTY_MUSCLES);
        } catch (err) {
            setError(err.message || "Nem sikerült betölteni a gyakorlatot.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        loadExercise();
    }, [loadExercise]);

    const hasSelection = muscles.primary.length > 0 || muscles.secondary.length > 0;

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Adj meg egy nevet.");
            return;
        }

        if (!hasSelection) {
            setError("Válassz ki legalább 1 izmot.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const updated = await updateExercise(id, {
                name: name.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim() || null,
                muscles,
            });

            navigate(`/workouts/${updated.id}`);
        } catch (err) {
            setError(err.message || "Nem sikerült elmenteni a módosításokat.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 text-slate-900 dark:text-white">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
                    Betöltés...
                </div>
            </div>
        );
    }

    if (error && !name && !description && !imageUrl && !hasSelection) {
        return (
            <div className="p-4 text-slate-900 dark:text-white">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/25 dark:bg-red-500/10">
                    <div className="text-lg font-extrabold text-red-700 dark:text-red-300">
                        Nem találom ezt a gyakorlatot.
                    </div>

                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>

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

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Gyakorlat szerkesztése</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Módosítsd a gyakorlat adatait és az érintett izmokat.
                    </p>
                </div>

                <div className="flex gap-2">
                    <NavLink
                        to={`/workouts/${id}`}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Vissza
                    </NavLink>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <MuscleMapPicker
                    value={muscles}
                    onChange={setMuscles}
                    initialView="front"
                    initialMode="primary"
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-base font-extrabold">Gyakorlat adatai</h3>

                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Kiválasztva:{" "}
                            <span className="font-bold">
                {muscles.primary.length + muscles.secondary.length}
              </span>
                        </div>
                    </div>

                    <label className="block">
                        <span className="mb-1 block text-sm font-bold">Név</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Pl. Fekvenyomás"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                        />
                    </label>

                    <label className="mt-3 block">
                        <span className="mb-1 block text-sm font-bold">Leírás</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Rövid leírás, technika, tippek..."
                            rows={4}
                            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                        />
                    </label>

                    <label className="mt-3 block">
                        <span className="mb-1 block text-sm font-bold">Kép URL</span>
                        <input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                        />
                    </label>

                    {imageUrl.trim() ? (
                        <div className="mt-3">
                            <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                                Előnézet:
                            </div>
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="max-h-56 rounded-xl border border-slate-200 bg-slate-50 object-contain dark:border-white/10 dark:bg-slate-950"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    ) : null}

                    {error ? (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                            {error}
                        </div>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate(`/workouts/${id}`)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                            Mégse
                        </button>

                        <button
                            type="submit"
                            disabled={saving || !hasSelection || !name.trim()}
                            className={[
                                "rounded-xl px-4 py-2 text-sm font-extrabold text-white transition-opacity",
                                "bg-pink-700 hover:bg-pink-800",
                                saving || !hasSelection || !name.trim()
                                    ? "cursor-not-allowed opacity-50"
                                    : "opacity-100",
                            ].join(" ")}
                        >
                            {saving ? "Mentés..." : "Módosítások mentése"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}