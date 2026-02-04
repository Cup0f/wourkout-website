import React from "react";
import Logo from "../../assets/logo.png";
import { HiMenuAlt1, HiMenuAlt3 } from "react-icons/hi";
import DarkMode from "./DarkMode";

const NavLinks = [
    {
        id: 1,
        name: "Home",
        link: "#",
    },
    {
        id: 2,
        name: "Products",
        link: "#",
    },
    {
        id: 3,
        name: "Pricing",
        link: "#",
    },
];

const Navbar = () => {
    const [showMenu, setShowMenu] = React.useState(false);
    const toggleMenu = () => setShowMenu(!showMenu);

    return (
        <div className="relative z-9999 text-black dark:text-white duration-300">
            <div className="container py-2 md:py-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={Logo} alt="Logo" className="h-16" />
                        <p className="text-3xl">
                            GYM <span className="font-bold">World</span>
                        </p>
                    </div>

                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-8">
                            {NavLinks.map(({ id, name, link }) => {
                                return (
                                    <li key={id} className="py-4">
                                        <a
                                            href={link}
                                            className="text-xl font-semibold hover:text-pink-700 py-2
                    hover:border-b-2
                    hover:border-sky-700
                    transition-colors duration-500"
                                        >
                                            {name}
                                        </a>
                                    </li>
                                );
                            })}
                            <DarkMode />
                        </ul>
                    </nav>

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
            </div>
        </div>
    );
};

export default Navbar;
