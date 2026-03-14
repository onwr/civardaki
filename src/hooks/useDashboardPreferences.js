"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadDashboardPreferences,
  saveDashboardPreferences,
  resetDashboardPreferences,
  updateDashboardWidgetOrder,
  toggleDashboardWidgetVisibility,
} from "@/lib/dashboard-preferences";

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState(() => loadDashboardPreferences());

  const updateOrder = useCallback((newOrder) => {
    setPreferences((prev) => {
      const next = updateDashboardWidgetOrder(prev, newOrder);
      saveDashboardPreferences(next);
      return next;
    });
  }, []);

  const toggleVisibility = useCallback((widgetId, isHidden) => {
    setPreferences((prev) => {
      const next = toggleDashboardWidgetVisibility(prev, widgetId, isHidden);
      saveDashboardPreferences(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const defaultPrefs = resetDashboardPreferences();
    setPreferences(defaultPrefs);
    return defaultPrefs;
  }, []);

  return {
    preferences,
    updateOrder,
    toggleVisibility,
    reset,
  };
}
