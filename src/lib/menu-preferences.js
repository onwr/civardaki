// Menü Tercihleri Yönetimi

const STORAGE_KEY = "business-menu-preferences-bh-v1";

// Varsayılan menü yapısı - tüm öğeler görünür ve mevcut sırada
export function getDefaultMenuPreferences(navigation) {
  const order = navigation.map((item, index) => ({
    id: item.href || `menu-${index}`,
    name: item.name,
    index: index,
  }));

  const hidden = [];
  const children = {};

  // Alt menü öğeleri için varsayılan tercihler
  navigation.forEach((item) => {
    if (item.children) {
      const parentId = item.href || `menu-${navigation.indexOf(item)}`;
      children[parentId] = {
        order: item.children.map((child, childIndex) => ({
          id: child.href,
          name: child.name,
          index: childIndex,
        })),
        hidden: [],
      };
    }
  });

  return {
    order,
    hidden,
    children,
  };
}

// LocalStorage'dan menü tercihlerini yükle
export function loadMenuPreferences(navigation) {
  if (typeof window === "undefined") {
    return getDefaultMenuPreferences(navigation);
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const defaultPrefs = getDefaultMenuPreferences(navigation);

      // Yeni öğeleri mevcut sıraya (order) ekle
      const currentOrder = parsed.order || [];
      const newItems = defaultPrefs.order.filter(
        (defItem) => !currentOrder.some((currItem) => currItem.id === defItem.id)
      );

      const mergedOrder = [...currentOrder, ...newItems];

      return {
        order: mergedOrder,
        hidden: parsed.hidden || defaultPrefs.hidden,
        children: { ...defaultPrefs.children, ...(parsed.children || {}) },
      };
    }
  } catch (error) {
    console.error("Menü tercihleri yüklenirken hata:", error);
  }

  return getDefaultMenuPreferences(navigation);
}

// Menü tercihlerini LocalStorage'a kaydet
export function saveMenuPreferences(preferences) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    // Custom event gönder (aynı sekmede yapılan değişiklikler için)
    // setTimeout ile asenkron hale getiriyoruz ki render sırasında başka component'i güncellemesin
    setTimeout(() => {
      window.dispatchEvent(new Event("menuPreferencesChanged"));
    }, 0);
  } catch (error) {
    console.error("Menü tercihleri kaydedilirken hata:", error);
  }
}

// Menü tercihlerini sıfırla
export function resetMenuPreferences(navigation) {
  const defaultPrefs = getDefaultMenuPreferences(navigation);
  saveMenuPreferences(defaultPrefs);
  return defaultPrefs;
}

// Menü öğesini gizle/göster
export function toggleMenuItemVisibility(preferences, itemId, isHidden) {
  const newHidden = isHidden
    ? [...preferences.hidden, itemId]
    : preferences.hidden.filter((id) => id !== itemId);
  return {
    ...preferences,
    hidden: newHidden,
  };
}

// Alt menü öğesini gizle/göster
export function toggleChildMenuItemVisibility(
  preferences,
  parentId,
  childId,
  isHidden
) {
  const newChildren = { ...preferences.children };
  if (!newChildren[parentId]) {
    newChildren[parentId] = { order: [], hidden: [] };
  }

  const newHidden = isHidden
    ? [...newChildren[parentId].hidden, childId]
    : newChildren[parentId].hidden.filter((id) => id !== childId);

  newChildren[parentId] = {
    ...newChildren[parentId],
    hidden: newHidden,
  };

  return {
    ...preferences,
    children: newChildren,
  };
}

// Menü sıralamasını güncelle
export function updateMenuOrder(preferences, newOrder) {
  return {
    ...preferences,
    order: newOrder.map((item, index) => ({
      ...item,
      index,
    })),
  };
}

// Alt menü sıralamasını güncelle
export function updateChildMenuOrder(preferences, parentId, newOrder) {
  const newChildren = { ...preferences.children };
  if (!newChildren[parentId]) {
    newChildren[parentId] = { order: [], hidden: [] };
  }

  newChildren[parentId] = {
    ...newChildren[parentId],
    order: newOrder.map((item, index) => ({
      ...item,
      index,
    })),
  };

  return {
    ...preferences,
    children: newChildren,
  };
}

