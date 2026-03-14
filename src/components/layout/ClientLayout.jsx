"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import MobileNav from "./MobileNav";

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const routeKey = pathname.split("/").slice(0, 3).join("/");

    return (
        <div className="flex flex-col min-h-screen">
            <AnimatePresence initial={false} mode="sync">
                <motion.main
                    key={routeKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex-grow"
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            <MobileNav />

            {/* Spacer for Mobile Nav so content isn't hidden behind it */}
            <div className="md:hidden h-20" />
        </div>
    );
}
