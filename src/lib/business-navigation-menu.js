"use client";

import { defaultNavigation, BusinessTypes } from "@/lib/navigation-config";
import { loadMenuPreferences } from "@/lib/menu-preferences";

/**
 * İşletme layout sol menüsü ile aynı: tür filtresi, sıra, gizlenenler, alt menü tercihleri.
 * @param {string} [businessType]
 */
export function getNavigationWithPreferences(businessType = BusinessTypes.INDIVIDUAL) {
  if (typeof window === "undefined") {
    return defaultNavigation.filter(
      (item) => !item.allowedTypes || item.allowedTypes.includes(businessType),
    );
  }

  const preferences = loadMenuPreferences(defaultNavigation);

  const typeFilteredNavigation = defaultNavigation.filter(
    (item) => !item.allowedTypes || item.allowedTypes.includes(businessType),
  );

  const sortedItems = [...preferences.order]
    .sort((a, b) => a.index - b.index)
    .map((pref) => {
      const item = typeFilteredNavigation.find(
        (nav) => (nav.href || `menu-${defaultNavigation.indexOf(nav)}`) === pref.id,
      );
      return item ? { ...item, _prefId: pref.id } : null;
    })
    .filter(Boolean);

  const visibleItems = sortedItems.filter((item) => !preferences.hidden.includes(item._prefId));

  const processedItems = visibleItems.map((item) => {
    if (!item.children) return item;

    const typeFilteredChildren = item.children.filter(
      (child) => !child.allowedTypes || child.allowedTypes.includes(businessType),
    );

    let sortedChildren = typeFilteredChildren;

    if (preferences.children[item._prefId]) {
      const childPrefs = preferences.children[item._prefId];

      sortedChildren = [...childPrefs.order]
        .sort((a, b) => a.index - b.index)
        .map((childPref) => {
          const child = typeFilteredChildren.find((c) => c.href === childPref.id);
          return child && !childPrefs.hidden.includes(childPref.id) ? child : null;
        })
        .filter(Boolean);
    }

    return {
      ...item,
      children: sortedChildren.length > 0 ? sortedChildren : undefined,
    };
  });

  return processedItems;
}
