const API_BASE_URL = "http://localhost:5156/api";

function buildUrl(path) {
    return `${API_BASE_URL}${path}`;
}

async function apiRequest(path, options = {}) {
    const response = await fetch(buildUrl(path), {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;

        try {
            const errorData = await response.json();
            errorMessage =
                errorData?.message ||
                errorData?.title ||
                JSON.stringify(errorData) ||
                errorMessage;
        } catch {
            try {
                errorMessage = await response.text();
            } catch {
                // marad az alap hibaüzenet
            }
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function normalizeMuscleRole(role) {
    if (typeof role === "string") {
        const normalized = role.trim().toLowerCase();
        if (normalized === "primary") return "primary";
        if (normalized === "secondary") return "secondary";
        return normalized;
    }

    // Ha backend enum számként jönne
    if (role === 1) return "primary";
    if (role === 2) return "secondary";

    return role;
}

function mapExerciseFromApi(exercise) {
    return {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description ?? "",
        imageUrl: exercise.imageUrl ?? null,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
        muscles: {
            primary: (exercise.muscles ?? [])
                .filter((m) => normalizeMuscleRole(m.role) === "primary")
                .map((m) => m.muscleKey),
            secondary: (exercise.muscles ?? [])
                .filter((m) => normalizeMuscleRole(m.role) === "secondary")
                .map((m) => m.muscleKey),
        },
    };
}

function mapExerciseToApi(payload) {
    const primary = (payload.muscles?.primary ?? []).map((muscleKey) => ({
        muscleKey,
        role: "primary",
    }));

    const secondary = (payload.muscles?.secondary ?? []).map((muscleKey) => ({
        muscleKey,
        role: "secondary",
    }));

    return {
        name: payload.name?.trim() ?? "",
        description: payload.description?.trim() || null,
        imageUrl: payload.imageUrl || null,
        muscles: [...primary, ...secondary],
    };
}

export async function getExercises() {
    const data = await apiRequest("/Exercises");
    return data.map(mapExerciseFromApi);
}

export async function getExerciseById(id) {
    const data = await apiRequest(`/Exercises/${id}`);
    return mapExerciseFromApi(data);
}

export async function createExercise(payload) {
    const data = await apiRequest("/Exercises", {
        method: "POST",
        body: JSON.stringify(mapExerciseToApi(payload)),
    });

    return mapExerciseFromApi(data);
}

export async function updateExercise(id, payload) {
    const data = await apiRequest(`/Exercises/${id}`, {
        method: "PUT",
        body: JSON.stringify(mapExerciseToApi(payload)),
    });

    return mapExerciseFromApi(data);
}

export async function deleteExercise(id) {
    await apiRequest(`/Exercises/${id}`, {
        method: "DELETE",
    });
}