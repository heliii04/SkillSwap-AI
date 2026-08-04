import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineMap, HiOutlineArrowLeft, HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#050505] p-6 text-white overflow-hidden">
            {/* Background Effects */}
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 text-center flex flex-col items-center"
            >
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-[#111111] shadow-2xl">
                    <HiOutlineMap className="text-5xl text-orange-500" />
                </div>
                
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-7xl font-bold tracking-tight sm:text-9xl bg-gradient-to-br from-white via-white/80 to-white/20 bg-clip-text text-transparent"
                >
                    404
                </motion.h1>
                
                <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Lost in the knowledge void?
                </h2>
                
                <p className="mt-4 max-w-md text-base leading-7 text-white/50 sm:text-lg">
                    The page you're looking for doesn't exist, has been moved, or maybe it's a skill we haven't acquired yet.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Link
                        to="/"
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm  text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#050505] font-bold"
                    >
                        <HiOutlineArrowLeft className="text-lg" />
                        Back to Home
                    </Link>
                    
                    {/* <Link
                        to="/search"
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-6 py-3.5 text-sm  text-white transition hover:border-gray-500 hover:bg-[#1a1a1a] font-bold"
                    >
                        <HiOutlineMagnifyingGlass className="text-lg" />
                        Discover Skills
                    </Link> */}
                </div>
            </motion.div>
        </div>
    );
}