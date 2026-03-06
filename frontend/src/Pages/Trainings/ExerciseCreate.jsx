import React from "react";
import { useNavigate } from "react-router-dom";
import MuscleMapPicker from "../../components/MuscleMapPicker";
import { createExercise } from "../../services/exerciseStore";

const EMPTY_MUSCLES = { primary: [], secondary: [] };

function uid() {
    return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

export default function ExerciseCreate() {
    const nav = useNavigate();

    const [muscles, setMuscles] = React.useState(EMPTY_MUSCLES);
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [imageFile, setImageFile] = React.useState(null);
    const [saving, setSaving] = React.useState(false);

    const hasSelection = muscles.primary.length || muscles.secondary.length;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!hasSelection) return alert("Válassz ki legalább 1 izmot.");
        if (!name.trim()) return alert("Adj meg egy nevet.");

        setSaving(true);
        try {
            const now = new Date().toISOString();
            const imageDataUrl = imageFile ? await fileToDataUrl(imageFile) : null;

            const ex = {
                id: uid(),
                name: name.trim(),
                description: description.trim(),
                muscles,
                imageDataUrl,
                createdAt: now,
                updatedAt: now,
            };

            createExercise(ex);
            nav(`/workouts/${ex.id}/edit`); // mentés után rögtön szerkesztőre dobjuk
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold">Új gyakorlat</h2>
                <button
                    type="button"
                    onClick={() => nav("/workouts")}
                    className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5"
                >
                    Lista
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <MuscleMapPicker value={muscles} onChange={setMuscles} />

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4">
                    <label className="block">
                        <span className="block text-sm font-bold mb-1">Név</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40"
                            placeholder="Pl. Fekvenyomás"
                        />
                    </label>

                    <label className="block mt-3">
                        <span className="block text-sm font-bold mb-1">Leírás</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none resize-y focus:ring-2 focus:ring-sky-500/40"
                            placeholder="Technika, tippek..."
                        />
                    </label>

                    <div className="mt-3">
                        <span className="block text-sm font-bold mb-1">Kép</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                            className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:text-white dark:file:bg-white dark:file:text-slate-900 file:px-4 file:py-2 file:cursor-pointer cursor-pointer"
                        />
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="submit"
                            disabled={saving || !hasSelection || !name.trim()}
                            className={[
                                "rounded-xl px-4 py-2 text-sm font-extrabold text-white",
                                "bg-pink-700 hover:bg-pink-800",
                                saving || !hasSelection || !name.trim()
                                    ? "opacity-50 cursor-not-allowed"
                                    : "opacity-100",
                            ].join(" ")}
                        >
                            {saving ? "Mentés..." : "Mentés"}
                        </button>
                    </div>
                    
                    {/* Segítő szöveg */}
                    {!hasSelection && (
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-300">
                            Válassz ki izmokat a testen, utána tudod értelmesen menteni a gyakorlatot.
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}