"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const NotificationContext = createContext();

const POLL_INTERVAL_MS = 30_000; // Poll every 30 seconds

export function NotificationProvider({ children }) {
  const { data: session, status } = useSession();
  const isBusinessUser = session?.user?.role === "BUSINESS";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isBusinessUser) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/business/notifications?limit=15", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("[NotificationProvider] fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isBusinessUser]);

  // Initial fetch + polling
  useEffect(() => {
    if (!isBusinessUser || status === "loading") return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isBusinessUser, fetchNotifications, status]);

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/business/notifications", { method: "PATCH" });
    } catch (e) {
      console.error("[NotificationProvider] markAllAsRead error:", e);
      fetchNotifications();
    }
  };

  const markOneAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/business/notifications/${notificationId}`, {
        method: "PATCH",
      });
    } catch (e) {
      console.error("[NotificationProvider] markOneAsRead error:", e);
      fetchNotifications();
    }
  }, []);

  const refresh = () => fetchNotifications();

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    markOneAsRead,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}