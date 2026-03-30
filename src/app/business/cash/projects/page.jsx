"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  PlusIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  CheckIcon,
  FolderIcon,
  ArchiveBoxIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
  className = "",
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ProjectSkeletonRow({ depth = 0 }) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
      style={{ marginLeft: depth * 20 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-3 w-28 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

const emptyForm = () => ({ name: "", description: "" });

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [parentForSub, setParentForSub] = useState(null);
  const [editingRow, setEditingRow] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [menuId, setMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuId(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      const params = new URLSearchParams();
      if (includeInactive) params.set("includeInactive", "true");

      const res = await fetch(`/api/business/cash/projects?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Liste alınamadı");

      setAllProjects(data.projects || []);
    } catch (e) {
      console.error(e);
      setApiError(e.message || "Projeler yüklenemedi.");
      toast.error("Projeler yüklenemedi.");
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const projects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allProjects;

    return allProjects.filter((p) => {
      const hay = [p.name, p.description].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [allProjects, search]);

  const summary = useMemo(() => {
    const total = allProjects.length;
    const active = allProjects.filter((p) => p.status === "ACTIVE").length;
    const archived = allProjects.filter((p) => p.status === "ARCHIVED").length;
    const subProjects = allProjects.filter((p) => Number(p.depth || 0) > 0).length;

    return {
      total,
      active,
      archived,
      subProjects,
    };
  }, [allProjects]);

  const openNew = () => {
    setEditingRow(null);
    setParentForSub(null);
    setForm(emptyForm());
    setModalOpen(true);
    setMenuId(null);
  };

  const openSubProject = (parent) => {
    setEditingRow(null);
    setParentForSub(parent);
    setForm(emptyForm());
    setModalOpen(true);
    setMenuId(null);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setParentForSub(null);
    setForm({
      name: row.name || "",
      description: row.description || "",
    });
    setModalOpen(true);
    setMenuId(null);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const submitModal = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Proje adı gerekli.");
      return;
    }

    setSaving(true);

    try {
      if (editingRow) {
        const res = await fetch(`/api/business/cash/projects/${editingRow.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Güncellenemedi");

        toast.success("Proje güncellendi.");
      } else {
        const res = await fetch("/api/business/cash/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            parentId: parentForSub?.id || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Kaydedilemedi");

        toast.success(parentForSub ? "Alt proje eklendi." : "Proje kaydedildi.");
      }

      setModalOpen(false);
      fetchList();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const setPassive = async (row) => {
    setMenuId(null);

    if (!confirm(`“${row.name}” projesini pasife almak istiyor musunuz?`)) return;

    try {
      const res = await fetch(`/api/business/cash/projects/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Pasife alınamadı");

      toast.success("Proje pasife alındı.");
      fetchList();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const inp =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400";
  const label =
    "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500";

  return (
    <div className="min-h-[calc(100vh-8rem)] space-y-6 text-[13px] text-slate-700">
      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <FolderIcon className="h-4 w-4" />
              Proje Yönetimi
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Projeler
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Projelerinizi ve alt projelerinizi tek ekranda yönetin, düzenleyin
              ve gerektiğinde pasife alın.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton onClick={openNew} icon={PlusIcon} tone="green">
              Yeni Proje Ekle
            </ActionButton>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam Proje"
          value={String(summary.total)}
          sub="Tüm proje kayıtları"
          icon={FolderIcon}
          tone="blue"
        />
        <StatCard
          title="Aktif Proje"
          value={String(summary.active)}
          sub="Kullanımdaki projeler"
          icon={CheckIcon}
          tone="emerald"
        />
        <StatCard
          title="Pasif Proje"
          value={String(summary.archived)}
          sub="Arşivlenmiş projeler"
          icon={ArchiveBoxIcon}
          tone="amber"
        />
        <StatCard
          title="Alt Proje"
          value={String(summary.subProjects)}
          sub="Hiyerarşik alt proje sayısı"
          icon={Squares2X2Icon}
          tone="slate"
        />
      </section>

      {apiError && (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Veri alınırken bir hata oluştu</p>
              <p className="mt-1 text-sm leading-6">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
              Filtreler
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Proje adı veya açıklamaya göre arama yapın, pasif kayıtları dahil edin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
                placeholder="proje adı…"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <span>Pasifleri de göster</span>
              <button
                type="button"
                role="switch"
                aria-checked={includeInactive}
                onClick={() => setIncludeInactive((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  includeInactive ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    includeInactive ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Proje Listesi</h3>
            <p className="mt-1 text-sm text-slate-500">
              Projeleri görüntüleyin, alt proje ekleyin veya düzenleyin
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Kayıt: {projects.length}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
              Pasifler: {includeInactive ? "Açık" : "Kapalı"}
            </span>
          </div>
        </div>

        <div ref={menuRef} className="space-y-2 p-4 md:p-5">
          {loading ? (
            <div className="space-y-3">
              <ProjectSkeletonRow depth={0} />
              <ProjectSkeletonRow depth={1} />
              <ProjectSkeletonRow depth={0} />
              <ProjectSkeletonRow depth={2} />
              <ProjectSkeletonRow depth={0} />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <FolderIcon className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-base font-bold text-slate-900">
                Henüz proje yok
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                İlk projenizi oluşturmak için aşağıdaki düğmeyi kullanın.
              </p>
              <button
                type="button"
                className="mt-4 font-semibold text-emerald-600 underline"
                onClick={openNew}
              >
                Yeni Proje Ekle
              </button>
            </div>
          ) : (
            projects.map((p, index) => (
              <div
                key={p.id}
                className={`relative flex items-center gap-2 rounded-xl border px-4 py-3 shadow-sm transition hover:shadow-md ${
                  index % 2 === 0
                    ? "border-sky-100 bg-sky-50/90"
                    : "border-slate-200 bg-white"
                }`}
                style={{ marginLeft: p.depth * 20 }}
              >
                <Link
                  href={`/business/cash/projects/${p.id}`}
                  className="min-w-0 flex-1 font-semibold text-sky-950 hover:underline"
                >
                  {p.name}
                  {p.status === "ARCHIVED" ? (
                    <span className="ml-2 text-xs font-normal text-amber-700">
                      (pasif)
                    </span>
                  ) : null}
                  {p.description ? (
                    <span className="mt-1 block truncate text-xs font-normal text-slate-500">
                      {p.description}
                    </span>
                  ) : null}
                </Link>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-600 transition hover:bg-white/80"
                    aria-label="Menü"
                    onClick={() => setMenuId((id) => (id === p.id ? null : p.id))}
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>

                  {menuId === p.id && (
                    <div className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                        onClick={() => openSubProject(p)}
                      >
                        Alt Proje Ekle
                      </button>

                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50"
                        onClick={() => openEdit(p)}
                      >
                        Düzenle
                      </button>

                      {p.status === "ACTIVE" ? (
                        <button
                          type="button"
                          className="block w-full px-4 py-2.5 text-left text-sm text-amber-800 hover:bg-amber-50"
                          onClick={() => setPassive(p)}
                        >
                          Pasife Ayır
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    Proje Tanımı
                  </p>
                  <h3 className="mt-1 text-lg font-bold">
                    {editingRow
                      ? "Projeyi Düzenle"
                      : parentForSub
                      ? "Alt Proje Ekle"
                      : "Yeni Proje"}
                  </h3>

                  {parentForSub ? (
                    <p className="mt-1 text-xs text-white/80">
                      Üst proje: {parentForSub.name}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                  disabled={saving}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={submitModal} className="space-y-4 p-5">
              <div>
                <label className={label}>Proje Adı</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={inp}
                />
              </div>

              <div>
                <label className={label}>Açıklama</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className={inp}
                />
              </div>

              <div className="flex justify-between gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}