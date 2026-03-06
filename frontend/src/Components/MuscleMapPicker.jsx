import React from "react";

import { REGIONS } from "./muscleMapData";

/**
 * MuscleMapPicker
 * - front/back view
 * - primary/secondary selection modes
 * - hover tooltip
 * - controlled via props: value + onChange
 *
 * value format:
 * {
 *   primary: string[],
 *   secondary: string[]
 * }
 */

const DEFAULT_VALUE = {primary: [], secondary: []};

const LABELS = {
    hoodedMuscle: "Csuklyásizom",
    chest: "Mell",
    abs: "Has",
    biceps: "Bicepsz",
    triceps: "Tricepsz",
    forearm: "Alkar",
    shoulders: "Váll",
    quads: "Combfeszítő",
    calves: "Vádli",
    lats: "Széles hát",
    traps: "Csuklya",
    glutes: "Farizom",
    hamstrings: "Combhajlító",
    lower_back: "Derék",
};

function toSet(arr) {
    return new Set(Array.isArray(arr) ? arr : []);
}
function setToSortedArray(set) {
    return Array.from(set).sort();
}
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function cn(...parts) {
    return parts.filter(Boolean).join(" ");
}
export default function MuscleMapPicker({
    value,
    onChange,
    initialView = "front",
    initialMode = "primary",
    height = 520,
    disabled = false,
}) {
    const controlled = value && typeof onChange === "function";
    const [internalValue, setInternalValue] = React.useState(DEFAULT_VALUE);
    const v = controlled ? value : internalValue;

    const [view, setView] = React.useState(initialView);
    const [mode, setMode] = React.useState(initialMode);

    const primary = React.useMemo(() => toSet(v?.primary), [v]);
    const secondary = React.useMemo(() => toSet(v?.secondary), [v]);

    const [hovered, setHovered] = React.useState(null); // {id,label,x,y} | null

    const commit = React.useCallback(
        (nextPrimarySet, nextSecondarySet) => {
            const next = {
                primary: setToSortedArray(nextPrimarySet),
                secondary: setToSortedArray(nextSecondarySet),
            };
            if (controlled) onChange(next);
            else setInternalValue(next);
        },
        [controlled, onChange]
    );

    const toggleMuscle = React.useCallback(
        (id) => {
            if (disabled) return;

            const p = new Set(primary);
            const s = new Set(secondary);

            if (mode === "primary") {
                if (p.has(id)) p.delete(id);
                else p.add(id);
                s.delete(id);
            } else {
                if (s.has(id)) s.delete(id);
                else s.add(id);
                p.delete(id);
            }

            commit(p, s);
        },
        [primary, secondary, mode, commit, disabled]
    );

    const clearAll = React.useCallback(() => {
        if (disabled) return;
        commit(new Set(), new Set());
    }, [commit, disabled]);

    const colorFor = React.useCallback(
        (id) => {
            if (primary.has(id)) return "#ef4444"; // red-500
            if (secondary.has(id)) return "#f59e0b"; // amber-500
            return "rgba(148,163,184,0.35)"; // slate-400 w/ alpha
        },
        [primary, secondary]
    );

    const strokeFor = React.useCallback(
        (id) => {
            if (primary.has(id)) return "#b91c1c"; // red-700
            if (secondary.has(id)) return "#b45309"; // amber-700
            return "rgba(148,163,184,0.7)"; // slate-400 w/ alpha
        },
        [primary, secondary]
    );

    const regions = REGIONS[view];

    const onEnter = (e, r) => {
        const bounds = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (!bounds) return;
        const x = clamp(e.clientX - bounds.left, 0, bounds.width);
        const y = clamp(e.clientY - bounds.top, 0, bounds.height);
        setHovered({ id: r.id, label: r.label, x, y });
    };
    const onMove = (e) => {
        if (!hovered) return;
        const bounds = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (!bounds) return;
        const x = clamp(e.clientX - bounds.left, 0, bounds.width);
        const y = clamp(e.clientY - bounds.top, 0, bounds.height);
        setHovered((h) => (h ? { ...h, x, y } : h));
    };
    const onLeave = () => setHovered(null);

    return (
        <div
            className={cn("grid gap-4", "text-slate-900 dark:text-white")}
            style={{ gridTemplateColumns: "minmax(320px, 560px) 320px" }}
        >
            {/* LEFT: MAP */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3">
                {/* Controls */}
                <div className="mb-3 flex flex-wrap items-center gap-3">
                    <Segmented
                        label="Nézet"
                        value={view}
                        disabled={disabled}
                        options={[
                            { value: "front", label: "Elöl" },
                            { value: "back", label: "Hátul" },
                        ]}
                        onChange={setView}
                    />

                    <Segmented
                        label="Mód"
                        value={mode}
                        disabled={disabled}
                        options={[
                            { value: "primary", label: "Fő izom" },
                            { value: "secondary", label: "Segéd izom" },
                        ]}
                        onChange={setMode}
                    />

                    <button
                        type="button"
                        onClick={clearAll}
                        disabled={disabled}
                        className={cn(
                            "ml-auto rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                            "border-slate-200 dark:border-white/10",
                            "bg-white dark:bg-slate-900",
                            "hover:bg-slate-50 dark:hover:bg-white/5",
                            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        )}
                    >
                        Törlés
                    </button>
                </div>

                <div style={{position: "relative"}}>
                    <svg
                        viewBox="210 100 200 600"
                        className="block w-full max-h-150"
                        style={{ height }}
                    >
                        {/* Base body silhouette */}
                        <path
                            d="m311.57,499.56c-.42.79-1.59,2.6-1.92,5.3-.24,1.94.05,3.59.33,4.67,0,0,1.42,7.28,2.67,16.67.94,7.1-1.89,9.98-4,18.67-2.05,8.45-.92,18.19,1.33,37.67,1.83,15.83,2.55,13.86,3.67,26.33,1.65,18.39,2.48,27.58-.67,33.33-1.25,2.29-4.36,7.01-3,12,.75,2.77,2.12,2.82,2.67,5.33,1.35,6.14-5.77,10.6-4.33,14,1.23,2.91,7.74,2.73,10.33,2.67,7.81-.19,18.39-.3,32.54-.04,1.42.03,2.62-1.1,2.64-2.52,0-.73-.13-1.46-.51-2.11-1.44-2.45-5.22-1.87-8.33-2.67-8.16-2.09-12.54-13.82-13.67-20.33-1.56-8.98,1.63-16.25,3.67-21.33,0,0,8.7-21.66,13.33-53.67,1.65-11.42,1.83-28.15-5.82-49.83-.12-.33-.17-.68-.14-1.03.14-2.05.3-5.1.3-8.81-.01-6.69-.55-8.81,0-12.33.92-5.86,3.93-9.78,5-11.33,8.52-12.4,10.79-45.37,11.33-53.33.03-.45.06-.87.06-.87s.39-6.22.21-13.1c-.71-28.06-5.6-51.37-5.6-51.37-.52-2.49-.94-4.27-1.67-8-1.38-7.05-2.08-11.91-3.67-23.33-2.88-20.72-3.12-23.07-1.67-27,1.21-3.26,2.26-4.02,4.33-9.67,3.02-8.21,3.41-13.72,4.33-13.67.95.06.48,6.01,2.67,15,1.62,6.65,2.86,7.43,3.67,11.67,1.51,7.93-1.76,10.96-3,19.67-.97,6.78,1.47,16.3,6.33,35.33,2.33,9.13,3.37,9.7,4,14.67.4,3.15,1.51,12.68-2,23.67-1.58,4.95-2.33,4.65-4,10.33-1.74,5.92-3.71,12.9-.67,17.33,0,0,.02.02,2.86,3.72.3.39.47.85.53,1.34.12,1.16.51,2.69,1.62,3.95,3.47,3.94,10.79,1.52,11.33,1.33,6.41-2.21,10.38-8.98,11.33-15,1.03-6.51-1.9-9.5-3.67-17-.68-2.87-1.41-7.34,1.67-26.67,4.5-28.26,7.83-29.78,7-42-.63-9.34-1.06-15.65-4.33-22.67-.91-1.95-2.06-4-2.67-7.33-1.05-5.77.78-8.53,1.67-15,1.16-8.47-.38-15.48-1-18.33-1.81-8.27-4.1-8.95-4-14.67.09-5.45,2.2-6.82,3.67-13,.19-.79,2.34-10.31-.67-20-.68-2.18-5.37-16.17-17.33-20.67-8.42-3.16-13.04,1.15-21.67-3.67-4.21-2.35-3-3.32-9-7.33-8.42-5.63-13.18-5.31-15.33-9.67-1.06-2.15-.12-3.25.67-10.67.71-6.73-.31-12.16.67-12.33.43-.08.6,1.03,1.44,1.22,1.84.43,4.48-3.99,5.78-6.89.29-.65,3.15-7.2,1.33-12.33-.6-1.69-1.41-2.39-1.89-2.72-1.31-.9-2.7-.06-3.33-.78-.82-.93.42-3.25.67-3.72,2.92-5.73-1.3-15.17-1.72-16.11-3.58-8.03-12.27-13.46-21-14.11-6.56-.49-11.47,1.84-13.61,2.89-2.03,1-11.39,5.58-14.17,15.56-1.97,7.08,0,14.62.83,15.94.01.02.41.66.28.78-.19.17-1.16-1.09-2.11-1.17-.82-.07-2.05.73-3.77,4.61-.11.25-.19.52-.21.8-.1,1.06-.15,2.51.04,4.2.94,8.39,6.83,14.23,8.5,13.78.1-.03.65,8.66,2.08,20.11.12.98-.33,1.95-1.16,2.49l-24.98,16.15-8.66.97c-5.16.99-9.35,1.8-13.67,5-4.34,3.22-6.43,7.11-8.33,10.67-1.51,2.81-3.71,7.67-4.67,14-1.56,10.33,1.1,18.87,2.96,23.45.24.59.25,1.23.03,1.82-1.34,3.78-2.56,8.03-3.46,12.73-2.9,15.11-1.22,28.24.89,37.28.15.66.05,1.35-.31,1.93-2.01,3.25-4.43,8.02-5.77,14.12-1.04,4.72-1.33,9.78.33,21.67,2.21,15.76,4.14,16.96,6,30.33,1.6,11.49,2.4,17.24,1.33,25-1.58,11.53-5.36,14.89-3.33,22.67.31,1.2,2.99,10.87,11.33,13.67,5.09,1.71,12.12.79,14-2.67.97-1.78.15-3.44,1.67-6,1.33-2.25,1.36-.59,2.34-3.08-.02-1.19.24-11.13-.44-12.33-4.33-7.63-3.25-8.38-4.57-10.25-6.95-9.83-4.35-22.84-3.33-29,1.28-7.75,2.88-6.37,6.67-20.33,2.71-10.01,4.07-15.01,3.67-20.33-.67-8.94-4.23-11.05-4-20.67.06-2.46.3-2.54,2-12,2.67-14.82,3.24-21.02,4.33-21,.97.01.18,4.93,3.33,11.67,2.73,5.84,5.57,6.95,5.67,11.33.06,2.6-.93,2.65-1.67,7.67-.63,4.3-.41,7.72-.33,8.67.53,6.89,2.65,7.91,1.67,11.67-.78,3-2.26,2.83-3.67,6.67-1.07,2.91-.97,5.07-1,8.67,0,0-.06,7.32-.67,14-.6,6.65-2.05,8.41-3.67,15.33-1.56,6.67-1.73,11.53-2,20.67-.61,20.57-1,33.72,2.33,50,0,0,1.06,5.17,13.79,41.72.14.4.18.82.12,1.24-.51,3.47-.86,8.47.1,14.37.52,3.22,1.07,4.46,1.33,7,.8,7.79-2.56,14-3.67,16.33-7.65,16.1-1.49,43.42.67,53,.41,1.81,3.05,10.09,8.33,26.67,6.53,20.48,8.29,25.08,6.33,32-.25.88-5.01,17.08-15,19.33-2.17.49-6.52.75-8,3.67,0,.01-.01.03-.02.04-.83,1.67.5,3.63,2.37,3.63h40.39c1.37,0,2.52-1.07,2.58-2.44.05-1.06-.02-2.27-.32-3.56-.96-4.12-3.4-5.08-3.33-8.33.05-2.63,1.65-3.03,2-6,.41-3.47-1.38-6.25-2-7.33-2.88-5.08-2.59-13.5-2-30.33.35-9.96.65-18.75,3-30.33,1.19-5.87,2.76-11.78,4-21.33.47-3.63,1.24-10.49-.6-17.83-.34-1.34-.92-3.33-1.07-3.84-2.4-8.22-3.48-9.34-4-12.33-.84-4.88,1.57-4.49,2.33-13,.43-4.75.91-10.13-1.33-16-1.21-3.17-2.35-4.22-2.33-7,.02-3.48,1.82-4.96,3-8.67,1.42-4.46.64-8.07.33-10.67-1.54-12.99,1.48-60.97,3-61,.86-.02,2.27,15.3,4.67,70,3.08,7.77,2.46,11.79,1.25,14.04Z"
                            className="fill-white dark:fill-slate-950"
                            stroke="rgba(148,163,184,0.55)"
                            strokeWidth="2.5"
                        />

                        {/* Clickable regions */}
                        {regions.map((r) => (
                            <g key={r.id}>
                                {r.shapes.map((shape, idx) => {
                                    const commonProps = {
                                        key: idx,
                                        fill: colorFor(r.id),
                                        stroke: strokeFor(r.id),
                                        strokeWidth: "2",
                                        style: {
                                            cursor: disabled ? "not-allowed" : "pointer",
                                            transition: "fill 120ms ease",
                                        },
                                        onClick: () => toggleMuscle(r.id),
                                        onMouseEnter: (e) => onEnter(e, r),
                                        onMouseMove: onMove,
                                        onMouseLeave: onLeave,
                                    };

                                    if (shape.type === "polygon") {
                                        return <polygon {...commonProps} points={shape.points} />;
                                    }

                                    return <path {...commonProps} d={shape.d} />;
                                })}
                            </g>
                        ))}
                    </svg>

                    {/* Tooltip */}
                    {hovered && (
                        <div
                            className="pointer-events-none absolute z-50 max-w-55 rounded-xl px-2 py-1.5 text-xs text-white shadow-lg"
                            style={{
                                left: hovered.x + 10,
                                top: hovered.y + 10,
                                background: "rgba(15, 23, 42, 0.92)",
                            }}
                        >
                            <div className="font-extrabold">{hovered.label}</div>
                            <div className="opacity-85">
                                {primary.has(hovered.id)
                                    ? "Fő izom"
                                    : secondary.has(hovered.id)
                                        ? "Segéd izom"
                                        : "Nincs kijelölve"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-3 text-slate-600 dark:text-slate-300">
                    <LegendDot color="#ef4444" label="Fő izom" />
                    <LegendDot color="#f59e0b" label="Segéd izom" />
                    <LegendDot color="rgba(148,163,184,0.35)" label="Nincs" outline />
                </div>
            </div>

            {/* RIGHT: LISTS */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-3">
                <h3 className="mb-2 text-base font-extrabold">Kiválasztás</h3>

                <Section title="Fő izmok" emptyText="Nincs kiválasztva">
                    <Chips
                        items={setToSortedArray(primary).map((id) => ({ id, label: LABELS[id] ?? id }))}
                        onRemove={(id) => {
                            const p = new Set(primary);
                            const s = new Set(secondary);
                            p.delete(id);
                            commit(p, s);
                        }}
                        disabled={disabled}
                        tone="primary"
                    />
                </Section>

                <Section title="Segéd izmok" emptyText="Nincs kiválasztva">
                    <Chips
                        items={setToSortedArray(secondary).map((id) => ({ id, label: LABELS[id] ?? id }))}
                        onRemove={(id) => {
                            const p = new Set(primary);
                            const s = new Set(secondary);
                            s.delete(id);
                            commit(p, s);
                        }}
                        disabled={disabled}
                        tone="secondary"
                    />
                </Section>

                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Tipp: először állítsd be a módot (Fő/Segéd), utána kattints a testre.
                </div>
            </div>
        </div>
    );
}

/* ---------- Small UI helpers (no deps) ---------- */

function Segmented({ label, value, options, onChange, disabled }) {
    return (
        <div className="flex items-center gap-2">
            <div className="text-xs font-extrabold text-slate-500 dark:text-slate-300">
                {label}:
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex">
                    {options.map((opt) => {
                        const active = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange(opt.value)}
                                className={cn(
                                    "px-3 py-2 text-[13px] font-extrabold transition-colors",
                                    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                    active
                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                        : "bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:hover:bg-white/5"
                                )}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function LegendDot({ color, label, outline = false }) {
    return (
        <div className="flex items-center gap-2">
      <span
          className="inline-block h-3 w-3 rounded-full"
          style={{
              background: color,
              border: outline ? "1px solid rgba(148,163,184,0.9)" : "none",
          }}
      />
            <span className="text-xs">{label}</span>
        </div>
    );
}

function Section({ title, children, emptyText }) {
    return (
        <div className="mt-3">
            <div className="mb-1.5 text-sm font-extrabold">{title}</div>
            <div>{children || <div className="text-sm text-slate-400">{emptyText}</div>}</div>
        </div>
    );
}

function Chips({ items, onRemove, disabled, tone }) {
    if (!items?.length) return <div className="text-sm text-slate-400">—</div>;

    const chipClasses =
        tone === "primary"
            ? "bg-red-100 border-red-200 text-red-900 dark:bg-red-500/15 dark:border-red-500/25 dark:text-red-200"
            : "bg-amber-100 border-amber-200 text-amber-900 dark:bg-amber-500/15 dark:border-amber-500/25 dark:text-amber-200";

    return (
        <div className="flex flex-wrap gap-2">
            {items.map((m) => (
                <span
                    key={m.id}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[13px] font-extrabold",
                        chipClasses
                    )}
                >
          {m.label}
                    <button
                        type="button"
                        onClick={() => onRemove(m.id)}
                        disabled={disabled}
                        className={cn(
                            "inline-flex h-4.5 w-4.5 items-center justify-center rounded-full font-black leading-none",
                            "bg-slate-900/10 hover:bg-slate-900/15 dark:bg-white/10 dark:hover:bg-white/15",
                            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        )}
                        aria-label={`Remove ${m.label}`}
                        title="Eltávolítás"
                    >
            ×
          </button>
        </span>
            ))}
        </div>
    );
}
