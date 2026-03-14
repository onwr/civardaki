"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadMenuPreferences,
  saveMenuPreferences,
  resetMenuPreferences,
  toggleMenuItemVisibility,
  toggleChildMenuItemVisibility,
  updateMenuOrder,
  updateChildMenuOrder,
} from "@/lib/menu-preferences";

export function useMenuPreferences(defaultNavigation) {
  const [preferences, setPreferences] = useState(() =>
    loadMenuPreferences(defaultNavigation)
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const savePreferences = useCallback((newPreferences) => {
    setPreferences(newPreferences);
    saveMenuPreferences(newPreferences);
  }, []);

  const toggleVisibility = useCallback(
    (itemId, isHidden) => {
      setPreferences((currentPrefs) => {
        const newPrefs = toggleMenuItemVisibility(currentPrefs, itemId, isHidden);
        saveMenuPreferences(newPrefs);
        return newPrefs;
      });
    },
    []
  );

  const toggleChildVisibility = useCallback(
    (parentId, childId, isHidden) => {
      setPreferences((currentPrefs) => {
        const newPrefs = toggleChildMenuItemVisibility(
          currentPrefs,
          parentId,
          childId,
          isHidden
        );
        saveMenuPreferences(newPrefs);
        return newPrefs;
      });
    },
    []
  );

  const updateOrder = useCallback(
    (newOrder) => {
      setPreferences((currentPrefs) => {
        const newPrefs = updateMenuOrder(currentPrefs, newOrder);
        saveMenuPreferences(newPrefs);
        return newPrefs;
      });
    },
    []
  );

  const updateChildOrder = useCallback(
    (parentId, newOrder) => {
      setPreferences((currentPrefs) => {
        const newPrefs = updateChildMenuOrder(currentPrefs, parentId, newOrder);
        saveMenuPreferences(newPrefs);
        return newPrefs;
      });
    },
    []
  );

  const reset = useCallback(() => {
    const defaultPrefs = resetMenuPreferences(defaultNavigation);
    setPreferences(defaultPrefs);
  }, [defaultNavigation]);

  return {
    preferences,
    isLoading,
    toggleVisibility,
    toggleChildVisibility,
    updateOrder,
    updateChildOrder,
    reset,
    savePreferences,
  };
}

