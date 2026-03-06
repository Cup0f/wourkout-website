import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import MuscleMapPicker from "../../Components/MuscleMapPicker.jsx";
import { getExercise, updateExercise } from "../../services/exerciseStore";

const EMPTY_MUSCLES = { primary: [], secondary: [] };

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

export default function ExerciseEdit() {
    const { id } = useParams();
    const nav = useNavigate();

    const [loaded, setLoaded] = React.useState(false);
    const [missing, setMissing] = React.useState(false);

    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [muscles, setMuscles] = React.useState(EMPTY_MUSCLES);
    const [imageDataUrl, setImageDataUrl] = React.useState(null);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        const ex = getExercise(id);
        if (!ex) {
            setMissing(true);
            setLoaded(true);
            return;
        }
        setName(ex.name || "");
        setDescription(ex.description || "");
        setMuscles(ex.muscles || EMPTY_MUSCLES);
        setImageDataUrl(ex.imageDataUrl || null);
        setLoaded(true);
    }, [id]);

    const onPickImage = async (file) => {
        if (!file) return;
        const url = await fileToDataUrl(file);
        setImageDataUrl(url);
    };

    const hasSelection = muscles.primary.length || muscles.secondary.length;

    const onSave = () => {
        if (!name.trim()) return alert("Adj meg egy nevet.");
        if (!hasSelection) return alert("Válassz ki legalább 1 izmot.");

        setSaving(true);
        try {
            updateExercise(id, {
                name: name.trim(),
                description: description.trim(),
                muscles,
                imageDataUrl,
            });
            nav("/workouts");
        } finally {
            setSaving(false);
        }
    };

    if (!loaded) return <div className="p-4 text-slate-900 dark:text-white">Betöltés…</div>;

    if (missing) {
        return (
            <div className="p-4 text-slate-900 dark:text-white">
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6">
                    <div className="text-lg font-extrabold">Nem találom ezt a gyakorlatot.</div>
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

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold">Szerkesztés</h2>
                <button
                    onClick={() => nav("/workouts")}
                    className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5"
                >
                    Lista
                </button>
            </div>

            <div className="space-y-4">
                <MuscleMapPicker value={muscles} onChange={setMuscles} />

                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-4">
                    <label className="block">
                        <span className="block text-sm font-bold mb-1">Név</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40"
                        />
                    </label>

                    <label className="block mt-3">
                        <span className="block text-sm font-bold mb-1">Leírás</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none resize-y focus:ring-2 focus:ring-sky-500/40"
                        />
                    </label>

                    <div className="mt-3">
                        <span className="block text-sm font-bold mb-1">Kép</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                            className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:text-white dark:file:bg-white dark:file:text-slate-900 file:px-4 file:py-2 file:cursor-pointer cursor-pointer"
                        />

                        {imageDataUrl ? (
                            <div className="mt-3">
                                <img
                                    src={imageDataUrl}
                                    alt="Preview"
                                    className="max-h-56 rounded-xl border border-slate-200 dark:border-white/10 object-contain bg-slate-50 dark:bg-slate-950"
                                />
                                <button
                                    onClick={() => setImageDataUrl(null)}
                                    className="mt-2 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-white/5"
                                >
                                    Kép eltávolítása
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Nincs kép feltöltve.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={onSave}
                            disabled={saving || !name.trim() || !(muscles.primary.length || muscles.secondary.length)}
                            className={[
                                "rounded-xl px-4 py-2 text-sm font-extrabold text-white",
                                "bg-pink-700 hover:bg-pink-800",
                                saving || !name.trim() || !(muscles.primary.length || muscles.secondary.length)
                                    ? "opacity-50 cursor-not-allowed"
                                    : "opacity-100",
                            ].join(" ")}
                        >
                            {saving ? "Mentés..." : "Mentés"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}