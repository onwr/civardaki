"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "broadcast_dismissed";
const SEEN_KEY = "broadcast_seen";

/**
 * Yerleşim ve hedef kitleye göre duyuruları çekip gösterir.
 * @param {Object} props
 * @param {string} props.layout - BANNER | MODAL | SIDEBAR | INLINE
 * @param {string} [props.audience] - ALL | USER | BUSINESS (API session'a göre de filtreler)
 */
export default function BroadcastSlot({ layout, audience }) {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!layout) {
      setLoading(false);
      return;
    }
    const params = new URLSearchParams({ layout });
    if (audience) params.set("audience", audience);
    fetch(`/api/broadcasts?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.broadcasts)) setBroadcasts(data.broadcasts);
        else setError(data.error || "Veri alınamadı");
      })
      .catch(() => setError("Yüklenemedi"))
      .finally(() => setLoading(false));
  }, [layout, audience]);

  if (loading) return null;
  if (error || !broadcasts.length) return null;

  if (layout === "BANNER") {
    return (
      <div className="broadcast-slot broadcast-banner" data-layout={layout}>
        {broadcasts.map((b) => (
          <BannerItem key={b.id} broadcast={b} />
        ))}
      </div>
    );
  }
  if (layout === "MODAL") {
    const seenIds = typeof window !== "undefined" ? getSeenIds() : [];
    const unseen = broadcasts.filter((b) => !seenIds.includes(b.id));
    const toShow = unseen[0];
    if (!toShow) return null;
    return (
      <div className="broadcast-slot broadcast-modal" data-layout={layout}>
        <ModalItem key={toShow.id} broadcast={toShow} />
      </div>
    );
  }
  if (layout === "SIDEBAR") {
    return (
      <div className="broadcast-slot broadcast-sidebar space-y-4" data-layout={layout}>
        {broadcasts.map((b) => (
          <SidebarItem key={b.id} broadcast={b} />
        ))}
      </div>
    );
  }
  return (
    <div className="broadcast-slot broadcast-inline space-y-4" data-layout={layout}>
      {broadcasts.map((b) => (
        <InlineItem key={b.id} broadcast={b} />
      ))}
    </div>
  );
}

function getDismissedIds() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setDismissed(id) {
  try {
    const ids = getDismissedIds();
    if (!ids.includes(id)) {
      localStorage.setItem(DISMISS_KEY, JSON.stringify([...ids, id]));
    }
  } catch {}
}

function getSeenIds() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSeen(id) {
  try {
    const ids = getSeenIds();
    if (!ids.includes(id)) {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...ids, id]));
    }
  } catch {}
}

function BannerItem({ broadcast }) {
  const [visible, setVisible] = useState(() => !getDismissedIds().includes(broadcast.id));

  const handleDismiss = () => {
    setDismissed(broadcast.id);
    setVisible(false);
  };

  if (!visible) return null;

  const linkLabel = broadcast.linkLabel?.trim() || "Detay";
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-blue-600 text-white px-4 py-3 border border-blue-500/30">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{broadcast.title}</p>
        {broadcast.body && (
          <p className="text-blue-100 text-xs mt-0.5 line-clamp-1">{broadcast.body}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {broadcast.linkUrl && (
          <a
            href={broadcast.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium underline hover:text-white"
          >
            {linkLabel}
          </a>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-lg hover:bg-blue-500/50 text-blue-100"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ModalItem({ broadcast }) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setSeen(broadcast.id);
    setOpen(false);
  };

  if (!open) return null;

  const linkLabel = broadcast.linkLabel?.trim() || "Detay";
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/50" aria-hidden onClick={handleClose} />
      <div className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-semibold text-slate-900">{broadcast.title}</h3>
          <button type="button" onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        {broadcast.body && <p className="text-slate-600 text-sm leading-relaxed mb-4">{broadcast.body}</p>}
        {broadcast.linkUrl && (
          <a
            href={broadcast.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            {linkLabel}
          </a>
        )}
      </div>
    </>
  );
}

function SidebarItem({ broadcast }) {
  const linkLabel = broadcast.linkLabel?.trim() || "Detay";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="font-semibold text-slate-900 text-sm">{broadcast.title}</p>
      {broadcast.body && <p className="text-slate-600 text-xs mt-1 line-clamp-3">{broadcast.body}</p>}
      {broadcast.linkUrl && (
        <a
          href={broadcast.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
        >
          {linkLabel}
        </a>
      )}
    </div>
  );
}

function InlineItem({ broadcast }) {
  const linkLabel = broadcast.linkLabel?.trim() || "Detay";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="font-semibold text-slate-900">{broadcast.title}</p>
      {broadcast.body && <p className="text-slate-600 text-sm mt-2">{broadcast.body}</p>}
      {broadcast.linkUrl && (
        <a
          href={broadcast.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          {linkLabel}
        </a>
      )}
    </div>
  );
}
