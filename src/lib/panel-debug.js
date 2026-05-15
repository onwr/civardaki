const PREFIX = "[Civardaki Panel Debug]";

/** Geliştirmede açık; prod'da: localStorage.setItem('civardaki_panel_debug','1') */
export function isPanelDebugEnabled() {
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window === "undefined") {
    return process.env.DEBUG_PANEL === "1";
  }
  try {
    return window.localStorage?.getItem("civardaki_panel_debug") === "1";
  } catch {
    return false;
  }
}

export function logPanelDebug(scope, payload) {
  if (!isPanelDebugEnabled()) return;
  console.log(`${PREFIX} ${scope}`, payload);
}

export function logPanelDebugTable(scope, rows) {
  if (!isPanelDebugEnabled()) return;
  console.log(`${PREFIX} ${scope}`);
  console.table(rows);
}
