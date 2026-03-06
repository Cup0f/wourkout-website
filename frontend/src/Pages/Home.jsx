import Logo from "../assets/man.png";

const Home = () => {
    return (
        <>
            <div className="py-12 sm:py-0 dark:bg-black dark:text-white duration-300 overflow-hidden">
                <div className="container min-h-100 flex relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center relative z-10">
                        <div className="space-y-5 lg:pr-20">
                            <h1 className="text-4xl font-semibold">
                                KÉSZÜLŐBEN PETI{" "}
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-sky-700 to-pink-700">
                                  PROFESSZINÁLIS EDZŐS OLDALA
                                </span>
                            </h1>
                            <p>
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Excepturi porro temporibus
                                odio exercitationem ea quibusdam voluptatibus obcaecati sint laboriosam labore. Iure
                                nesciunt officia minima, eum nostrum amet cum recusandae inventore!
                            </p>
                        </div>
                        <div>
                            <img src={Logo} alt="" className="h-150"/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
