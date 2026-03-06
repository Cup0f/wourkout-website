import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { listExercises } from "../../services/exerciseStore";
import { createWorkoutDay } from "../../services/workoutDayStore";

function uid() {
    return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export default function WorkoutDayCreate() {
    const navigate = useNavigate();

    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [search, setSearch] = React.useState("");
    const [availableExercises, setAvailableExercises] = React.useState([]);
    const [selectedItems, setSelectedItems] = React.useState([]);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        setAvailableExercises(listExercises());
    }, []);

    const filteredExercises = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return availableExercises;

        return availableExercises.filter((ex) => {
            const inName = ex.name?.toLowerCase().includes(q);
            const inDesc = ex.description?.toLowerCase().includes(q);
            return inName || inDesc;
        });
    }, [availableExercises, search]);

    const selectedIds = React.useMemo(
        () => new Set(selectedItems.map((item) => item.exerciseId)),
        [selectedItems]
    );

    const addExercise = (exercise) => {
        if (selectedIds.has(exercise.id)) return;

        setSelectedItems((prev) => [
            ...prev,
            {
                id: uid(),
                exerciseId: exercise.id,
                status: "todo",
                order: prev.length,
            },
        ]);
    };

    const removeExercise = (itemId) => {
        setSelectedItems((prev) =>
            prev
                .filter((item) => item.id !== itemId)
                .map((item, index) => ({ ...item, order: index }))
        );
    };

    const moveExercise = (index, direction) => {
        setSelectedItems((prev) => {
            const next = [...prev];
            const newIndex = direction === "up" ? index - 1 : index + 1;

            if (newIndex < 0 || newIndex >= next.length) return prev;

            [next[index], next[newIndex]] = [next[newIndex], next[index]];

            return next.map((item, i) => ({ ...item, order: i }));
        });
    };

    const clearForm = () => {
        setName("");
        setDescription("");
        setSearch("");
        setSelectedItems([]);
    };

    const onSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Adj nevet az edzésnapnak.");
            return;
        }

        if (!selectedItems.length) {
            alert("Adj hozzá legalább 1 gyakorlatot.");
            return;
        }

        setSaving(true);

        try {
            const now = new Date().toISOString();

            const payload = {
                id: uid(),
                name: name.trim(),
                description: description.trim(),
                createdAt: now,
                updatedAt: now,
                exercises: selectedItems.map((item, index) => ({
                    ...item,
                    order: index,
                })),
            };

            createWorkoutDay(payload);
            navigate(`/workouts/days/${payload.id}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 text-slate-900 dark:text-white">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">Új edzésnap</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Mentett gyakorlatokból állíts össze egy új edzésnapot.
                    </p>
                </div>

                <div className="flex gap-2">
                    <NavLink
                        to="/workouts/days"
                        className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        Edzésnapok
                    </NavLink>

                    <NavLink
                        to="/workouts"
                        className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                        Gyakorlatok
                    </NavLink>
                </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-3">
                {/* BAL: alap adatok + kiválasztható gyakorlatok */}
                <div className="space-y-4 xl:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <h2 className="mb-3 text-lg font-extrabold">Edzésnap adatai</h2>

                        <label className="block">
                            <span className="mb-1 block text-sm font-bold">Név</span>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Pl. Push nap"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                            />
                        </label>

                        <label className="mt-3 block">
                            <span className="mb-1 block text-sm font-bold">Leírás</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Pl. Mell, váll, tricepsz fókusz"
                                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                            />
                        </label>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-extrabold">Elérhető gyakorlatok</h2>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {availableExercises.length} db mentett gyakorlat
                            </div>
                        </div>

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Keresés név vagy leírás alapján..."
                            className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-white/10 dark:bg-slate-950"
                        />

                        {!filteredExercises.length ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                                Nincs találat.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredExercises.map((exercise) => {
                                    const alreadySelected = selectedIds.has(exercise.id);

                                    return (
                                        <div
                                            key={exercise.id}
                                            className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-extrabold">{exercise.name}</div>
                                                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                    {exercise.description || "Nincs leírás."}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addExercise(exercise)}
                                                disabled={alreadySelected}
                                                className={[
                                                    "shrink-0 rounded-xl px-3 py-2 text-sm font-extrabold text-white",
                                                    alreadySelected
                                                        ? "cursor-not-allowed bg-slate-400 dark:bg-slate-700"
                                                        : "bg-pink-700 hover:bg-pink-800",
                                                ].join(" ")}
                                            >
                                                {alreadySelected ? "Hozzáadva" : "Hozzáadás"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* JOBB: kiválasztott gyakorlatok */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-extrabold">Edzésnap tartalma</h2>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {selectedItems.length} gyakorlat
                            </div>
                        </div>

                        {!selectedItems.length ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                                Még nincs hozzáadva gyakorlat.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedItems.map((item, index) => {
                                    const ex = availableExercises.find((x) => x.id === item.exerciseId);
                                    if (!ex) return null;

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-slate-200 p-3 dark:border-white/10"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                        #{index + 1}
                                                    </div>
                                                    <div className="font-extrabold">{ex.name}</div>
                                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        Státusz induláskor: Elvégzendő
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeExercise(item.id)}
                                                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-50 dark:border-red-500/25 dark:text-red-300 dark:hover:bg-red-500/10"
                                                >
                                                    Törlés
                                                </button>
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => moveExercise(index, "up")}
                                                    disabled={index === 0}
                                                    className={[
                                                        "rounded-lg border px-3 py-1.5 text-xs font-extrabold",
                                                        index === 0
                                                            ? "cursor-not-allowed border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-500"
                                                            : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5",
                                                    ].join(" ")}
                                                >
                                                    Fel
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => moveExercise(index, "down")}
                                                    disabled={index === selectedItems.length - 1}
                                                    className={[
                                                        "rounded-lg border px-3 py-1.5 text-xs font-extrabold",
                                                        index === selectedItems.length - 1
                                                            ? "cursor-not-allowed border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-500"
                                                            : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5",
                                                    ].join(" ")}
                                                >
                                                    Le
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={clearForm}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                            >
                                Űrlap törlése
                            </button>

                            <button
                                type="submit"
                                disabled={saving || !name.trim() || !selectedItems.length}
                                className={[
                                    "rounded-xl px-4 py-2 text-sm font-extrabold text-white",
                                    saving || !name.trim() || !selectedItems.length
                                        ? "cursor-not-allowed bg-slate-400 dark:bg-slate-700"
                                        : "bg-pink-700 hover:bg-pink-800",
                                ].join(" ")}
                            >
                                {saving ? "Mentés..." : "Edzésnap mentése"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <div className="mb-2 text-sm font-extrabold">Tipp</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                            Először add hozzá a gyakorlatokat, utána rendezd őket a kívánt sorrendbe.
                            A státuszok majd az edzésnap megnyitásakor állíthatók.
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}