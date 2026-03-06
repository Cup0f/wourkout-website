import React from "react";
import Logo from "../../assets/logo.png";
import {HiMenuAlt1, HiMenuAlt3} from "react-icons/hi";
import {NavLink} from "react-router-dom";
import DarkMode from "./DarkMode";

const NavLinks = [
    {name: "Kezdőlap", link: "/"},
    {name: "Naptár", link: "/calendar"},
    {
        name: "Edzések",
        link: "/workouts",
        submenu: [
            {name: "Edzés napok", link: "/workouts/days"},
        ],
    },
    {name: "Térkép", link: "/map"},
];

const Navbar = () => {
    const [showMenu, setShowMenu] = React.useState(false);
    const [openMenuKey, setOpenMenuKey] = React.useState(null);
    const toggleMenu = () => setShowMenu((p) => !p);

    React.useEffect(() => {
        const onClick = (e) => {
            if (!e.target.closest("[data-dropdown]")) {
                setOpenMenuKey(null);
            }
        };

        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const onNavPanelMove = (e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    return (
        <div className="relative z-9999 text-black dark:text-white duration-300">
            <div className="container py-2 md:py-0">
                <div className="flex justify-between items-center">
                    <NavLink
                        to="/"
                        className="flex items-center gap-3"
                        onClick={() => {
                            setOpenMenuKey(null);
                            setShowMenu(false);
                        }}
                    >
                        <img src={Logo} alt="Logo" className="h-16"/>
                        <p className="text-3xl">
                            GYM <span className="font-bold">World</span>
                        </p>
                    </NavLink>

                    {/* DESKTOP */}
                    <nav className="hidden md:block">
                        <ul
                            className="nav-panel flex items-center gap-2 px-2 py-2 rounded-2xl"
                            onMouseMove={onNavPanelMove}
                        >
                            {NavLinks.map(({ name, link, submenu }) => (
                                <li key={link} className="relative" data-dropdown>
                                    {submenu ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setOpenMenuKey(openMenuKey === link ? null : link)}
                                                className="nav-item text-xl font-semibold px-4 py-2 rounded-xl"
                                            >
                                                {name}
                                            </button>

                                            {/* dropdown ugyanaz maradhat */}
                                            {openMenuKey === link && (
                                                <ul
                                                    className="absolute left-0 top-full mt-2 min-w-45
                                                        rounded-xl shadow-lg border
                                                        border-black/10 dark:border-white/10
                                                        bg-white/95 dark:bg-slate-900/95
                                                        backdrop-blur-md
                                                        overflow-hidden"
                                                >
                                                    {/* opcionális: legyen egy 'Összes' link is */}
                                                    <li>
                                                        <NavLink
                                                            to={link}
                                                            className="block px-4 py-3 text-base font-semibold
                                                            text-black dark:text-white
                                                            hover:text-pink-700
                                                            hover:bg-sky-50 dark:hover:bg-white/5
                                                            transition-colors duration-300"
                                                            onClick={() => setOpenMenuKey(null)}
                                                        >
                                                            Gyakorlatok
                                                        </NavLink>
                                                    </li>

                                                    {submenu.map((item) => (
                                                        <li key={item.link}>
                                                            <NavLink
                                                                to={item.link}
                                                                className="block px-4 py-3 text-base font-semibold
                                                                  text-black dark:text-white
                                                                  hover:text-pink-700
                                                                  hover:bg-sky-50 dark:hover:bg-white/5
                                                                  transition-colors duration-300"
                                                                onClick={() => setOpenMenuKey(null)}
                                                            >
                                                                {item.name}
                                                            </NavLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    ) : (
                                        <NavLink
                                            to={link}
                                            className={({ isActive }) =>
                                                `nav-item text-xl font-semibold px-4 py-2 rounded-xl
             ${isActive ? "nav-item--active" : ""}`
                                            }
                                            onClick={() => setOpenMenuKey(null)}
                                        >
                                            {name}
                                        </NavLink>
                                    )}
                                </li>
                            ))}

                            <DarkMode />
                        </ul>
                    </nav>

                    {/* MOBILE ICONS */}
                    <div className="md:hidden block">
                        <div className="flex items-center gap-4">
                            <DarkMode/>
                            {showMenu ? (
                                <HiMenuAlt1
                                    onClick={toggleMenu}
                                    className="cursor-pointer"
                                    size={30}
                                />
                            ) : (
                                <HiMenuAlt3
                                    onClick={toggleMenu}
                                    className="cursor-pointer"
                                    size={30}
                                />
                            )}
                        </div>
                    </div>
                </div>
                
                {showMenu && (
                    <div
                        className="md:hidden mt-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden">
                        <ul className="flex flex-col">
                            {NavLinks.map(({name, link, submenu}) => (
                                <li key={link} className="border-b border-black/5 dark:border-white/10">
                                    {!submenu ? (
                                        <NavLink
                                            to={link}
                                            className="block px-4 py-3 font-semibold hover:text-pink-700"
                                            onClick={() => {
                                                setShowMenu(false);
                                                setOpenMenuKey(null);
                                            }}
                                        >
                                            {name}
                                        </NavLink>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="w-full text-left px-4 py-3 font-semibold hover:text-pink-700"
                                                onClick={() =>
                                                    setOpenMenuKey(openMenuKey === link ? null : link)
                                                }
                                            >
                                                {name}
                                            </button>

                                            {openMenuKey === link && (
                                                <div className="pb-2">
                                                    <NavLink
                                                        to={link}
                                                        className="block px-6 py-2 text-sm font-semibold hover:text-pink-700"
                                                        onClick={() => {
                                                            setShowMenu(false);
                                                            setOpenMenuKey(null);
                                                        }}
                                                    >
                                                        Összes
                                                    </NavLink>

                                                    {submenu.map((s) => (
                                                        <NavLink
                                                            key={s.link}
                                                            to={s.link}
                                                            className="block px-6 py-2 text-sm font-semibold hover:text-pink-700"
                                                            onClick={() => {
                                                                setShowMenu(false);
                                                                setOpenMenuKey(null);
                                                            }}
                                                        >
                                                            {s.name}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
