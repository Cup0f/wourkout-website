import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import MuscleMapPicker from "../../components/MuscleMapPicker";
import { createExercise } from "../../api/exercisesApi";

const EMPTY_MUSCLES = { primary: [], secondary: [] };

export default function ExerciseCreate() {
    const navigate = useNavigate();

    const [muscles, setMuscles] = React.useState(EMPTY_MUSCLES);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [imageUrl, setImageUrl] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState("");

    const hasSelection = muscles.primary.length > 0 || muscles.secondary.length > 0;

    const clearForm = () => {
        setMuscles(EMPTY_MUSCLES);
        setName("");
        setDescription("");
        setImageUrl("");
        setError("");
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!hasSelection) {
            setError("Válassz ki legalább 1 izmot.");
            return;
        }

        if (!name.trim()) {
            setError("Adj meg egy nevet.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const created = await createExercise({
                name: name.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim() || null,
                muscles,
            });

            navigate(`/workouts/${created.id}`);
        } catch (err) {
            setError(err.message || "Nem sikerült elmenteni a gyakorlatot.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Új gyakorlat</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Hozz létre egy új gyakorlatot, és mentsd az adatbázisba.
                    </p>
                </div>

                <div className="flex gap-2">
                    <NavLink
                        to="/workouts"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    >
                        Lista
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
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Később ezt lecserélhetjük valódi képfeltöltésre.
                        </div>
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
                            onClick={clearForm}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                            Űrlap törlése
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
                            {saving ? "Mentés..." : "Mentés"}
                        </button>
                    </div>

                    {!hasSelection ? (
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-300">
                            Válassz ki izmokat a testen, utána tudod elmenteni a gyakorlatot.
                        </p>
                    ) : null}
                </div>
            </form>
        </div>
    );
}