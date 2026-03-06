import Navbar from "../Components/Navbar/Navbar.jsx";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
    return (
        <main className="overflow-x-hidden bg-white dark:bg-black min-h-screen">
            <Navbar />
            <div className="mx-auto max-w-6xl px-4 py-6">
                <Outlet />
            </div>
        </main>
    );
}
