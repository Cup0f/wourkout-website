import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import RootLayout from "./layouts/RootLayout.jsx";

import Home from "./Pages/Home.jsx";
import ExerciseList from "./Pages/Trainings/ExerciseList.jsx";
import ExerciseCreate from "./Pages/Trainings/ExerciseCreate.jsx";
import ExerciseEdit from "./Pages/Trainings/ExerciseEdit.jsx";
import ExerciseView from "./Pages/Trainings/ExerciseView.jsx";
import WorkoutDayList from "./Pages/Trainings/WorkoutDayList.jsx";
import WorkoutDayCreate from "./Pages/Trainings/WorkoutDayCreate.jsx";
import WorkoutDayView from "./Pages/Trainings/WorkoutDayView.jsx";
import WorkoutDayEdit from "./Pages/Trainings/WorkoutDayEdit.jsx";
import Calendar from "./Pages/Calendar.jsx";

const Placeholder = ({ title }) => (
    <div className="text-black dark:text-white text-2xl font-semibold">{title}</div>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Home /> },

            { path: "calendar", element: <Calendar /> },
            { path: "map", element: <Placeholder title="Térkép" /> },
            
            {
                path: "workouts",
                children: [
                    { index: true, element: <ExerciseList /> },
                    { path: "new", element: <ExerciseCreate title="New"/> },
                    { path: ":id", element: <ExerciseView /> },
                    { path: ":id/edit", element: <ExerciseEdit /> },

                    { path: "days", element: <WorkoutDayList /> },
                    { path: "days/new", element: <WorkoutDayCreate /> },
                    { path: "days/:id", element: <WorkoutDayView /> },
                    { path: "days/:id/edit", element: <WorkoutDayEdit /> },
                ],
            },
        ],
    },
]);
