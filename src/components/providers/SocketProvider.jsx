"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";
import { useSession } from "next-auth/react";

/** Web Audio API ile bip sesi üretir. Ekstra dosya gerektirmez. */
function playBeep({ frequency = 880, duration = 120, volume = 0.6, type = "sine", delay = 0 } = {}) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration / 1000);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration / 1000 + 0.05);
        osc.onended = () => ctx.close();
    } catch (_) { /* Ses desteklenmiyorsa sessizce geç */ }
}

function playOrderSound() {
    // Sipariş: iki yükselen bip
    playBeep({ frequency: 660, duration: 130, delay: 0 });
    playBeep({ frequency: 880, duration: 180, delay: 0.18 });
}

function playLeadSound() {
    // Talep: üç çıkıcı bip (farklı ton)
    playBeep({ frequency: 520, duration: 100, delay: 0 });
    playBeep({ frequency: 660, duration: 100, delay: 0.14 });
    playBeep({ frequency: 780, duration: 160, delay: 0.28 });
}

function showDesktopNotif(title, body, icon = "/favicon.ico") {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
        try {
            new Notification(title, { body, icon });
        } catch (_) { }
    } else if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
                try { new Notification(title, { body, icon }); } catch (_) { }
            }
        });
    }
}

const SocketContext = createContext({
    socket: null,
    isConnected: false,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { data: session, status } = useSession();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (status !== "authenticated" || !session?.user) {
            return;
        }
        const businessId = session.user.businessId || undefined;
        const userId = session.user.id || undefined;
        if (!businessId && !userId) {
            return;
        }

        const query = {};
        if (businessId) query.businessId = businessId;
        if (userId) query.userId = userId;

        const fromEnv = (
            process.env.NEXT_PUBLIC_SOCKET_URL ||
            process.env.NEXT_PUBLIC_APP_URL ||
            ""
        ).trim();
        const isLocalPage =
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1");
        let socketBaseUrl = fromEnv;
        if (typeof window !== "undefined") {
            const pointsToLoopback =
                /localhost|127\.0\.0\.1/.test(socketBaseUrl) && !isLocalPage;
            if (!socketBaseUrl || pointsToLoopback) {
                socketBaseUrl = window.location.origin;
            }
        }

        const socketInstance = new ClientIO(socketBaseUrl, {
            path: "/api/socket/io",
            query,
            addTrailingSlash: false,
        });

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        // ── Sesli & masaüstü bildirimler ──────────────────────────────
        socketInstance.on("new_order", (data) => {
            playOrderSound();
            const name = data?.customerName || "Müşteri";
            const total = data?.total != null
                ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(data.total)
                : "";
            showDesktopNotif(
                "🛒 Yeni Sipariş!",
                `${name}${total ? " · " + total : ""}`,
            );
        });

        socketInstance.on("new_lead", (data) => {
            playLeadSound();
            const name = data?.name || "Müşteri";
            const title = data?.title || "Hizmet talebi";
            showDesktopNotif(
                "📩 Yeni Talep!",
                `${name} · ${title}`,
            );
        });
        // ─────────────────────────────────────────────────────────────

        setSocket(socketInstance);

        // Cleanup on unmount or session change
        return () => {
            socketInstance.disconnect();
        };
    }, [session, status]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
