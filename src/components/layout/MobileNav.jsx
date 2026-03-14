"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, MessageSquare, User, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { label: "Keşfet", icon: Home, href: "/" },
        { label: "Ara", icon: Search, href: "/search" },
        { label: "Talepler", icon: MessageSquare, href: "/user/leads" },
        { label: "Profil", icon: User, href: "/user/profile" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60]">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200" />

            <div className="relative flex items-center justify-around h-20 pb-safe px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center min-w-[64px]"
                        >
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                className={`p-2 rounded-2xl transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                            >
                                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                            </motion.div>

                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-active"
                                    className="absolute -top-1 w-12 h-1 bg-blue-600 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
