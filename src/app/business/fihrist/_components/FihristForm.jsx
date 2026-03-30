"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Camera,
  Check,
  Undo2,
  List,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const inp =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-400";
const label =
  "mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500";
const tabBar = "flex rounded-t-2xl overflow-hidden bg-[#5ecfb1]";

export default function FihristForm({ mode = "create", entryId = null, initial = null }) {
  const router = useRouter();
  const [tab, setTab] = useState("card");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [master, setMaster] = useState({ FIHRIST_1: [], FIHRIST_2: [] });
  const [addOpen, setAddOpen] = useState(false);
  const [addKind, setAddKind] = useState("FIHRIST_1");
  const [addName, setAddName] = useState("");

  const [form, setForm] = useState({
    name: "",
    class1Id: "",
    class2Id: "",
    authorizedPerson: "",
    email: "",
    phone1: "",
    phone2: "",
    address: "",
    note: "",
    imageUrl: "",
  });

  const loadMaster = useCallback(async () => {
    try {
      const r = await fetch("/api/business/masterdata");
      if (!r.ok) return;
      const d = await r.json();
      setMaster({
        FIHRIST_1: d.byKind?.FIHRIST_1 || [],
        FIHRIST_2: d.byKind?.FIHRIST_2 || [],
      });
    } catch {
      /* sessiz */
    }
  }, []);

  useEffect(() => {
    void loadMaster();
  }, [loadMaster]);

  useEffect(() => {
    if (!initial) return;
    setForm({
      name: initial.name || "",
      class1Id: initial.class1Id || "",
      class2Id: initial.class2Id || "",
      authorizedPerson: initial.authorizedPerson || "",
      email: initial.email || "",
      phone1: initial.phone1 || "",
      phone2: initial.phone2 || "",
      address: initial.address || "",
      note: initial.note || "",
      imageUrl: initial.imageUrl || "",
    });
  }, [initial]);

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "GALLERY");
      const res = await fetch("/api/business/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Yükleme başarısız.");
        return;
      }
      setF("imageUrl", data.url);
      toast.success("Görsel yüklendi.");
    } catch {
      toast.error("Yükleme başarısız.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submitAddClass = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const name = addName.trim();
    if (!name) {
      toast.error("Sınıf adı girin.");
      return;
    }
    try {
      const res = await fetch("/api/business/masterdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: addKind, name }),
      });
      const row = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(row.message || "Eklenemedi.");
        return;
      }
      await loadMaster();
      if (addKind === "FIHRIST_1") setF("class1Id", row.id);
      else setF("class2Id", row.id);
      setAddName("");
      setAddOpen(false);
      toast.success("Sınıflandırma eklendi.");
    } catch {
      toast.error("İstek başarısız.");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("İsim / unvan zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone1: form.phone1.trim() || null,
        phone2: form.phone2.trim() || null,
        email: form.email.trim() || null,
        authorizedPerson: form.authorizedPerson.trim() || null,
        address: form.address.trim() || null,
        note: form.note.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        class1Id: form.class1Id || null,
        class2Id: form.class2Id || null,
      };

      const url =
        mode === "create"
          ? "/api/business/fihrist"
          : `/api/business/fihrist/${entryId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message || "Kaydedilemedi.");
        return;
      }
      toast.success("Kaydedildi.");
      router.push("/business/fihrist");
    } catch {
      toast.error("Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(e);
      }}
    >
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Kaydet
        </button>
        <button
          type="button"
          onClick={() => router.push("/business/fihrist")}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-600 bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
        >
          <Undo2 className="h-4 w-4" />
          Geri Dön
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className={tabBar}>
          <button
            type="button"
            onClick={() => setTab("card")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition ${
              tab === "card"
                ? "bg-white text-[#2a9d84]"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
          >
            <User className="h-4 w-4" />
            KART BİLGİLERİ
          </button>
          <button
            type="button"
            onClick={() => setTab("other")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition ${
              tab === "other"
                ? "bg-white text-[#2a9d84]"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
          >
            <List className="h-4 w-4" />
            DİĞER BİLGİLER
          </button>
        </div>

        <div className="p-4 md:p-6">
          {tab === "card" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div>
                  <label className={label}>İsim / Unvan</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inp}
                      value={form.name}
                      onChange={(e) => setF("name", e.target.value)}
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <label className={label}>Sınıflandırma 1</label>
                  <select
                    className={`${inp} pl-3`}
                    value={form.class1Id}
                    onChange={(e) => setF("class1Id", e.target.value)}
                  >
                    <option value="">—</option>
                    {master.FIHRIST_1.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setAddKind("FIHRIST_1");
                      setAddOpen(true);
                    }}
                    className="mt-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    + yeni sınıflandırma ekle
                  </button>
                </div>

                <div>
                  <label className={label}>Sınıflandırma 2</label>
                  <select
                    className={`${inp} pl-3`}
                    value={form.class2Id}
                    onChange={(e) => setF("class2Id", e.target.value)}
                  >
                    <option value="">—</option>
                    {master.FIHRIST_2.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setAddKind("FIHRIST_2");
                      setAddOpen(true);
                    }}
                    className="mt-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    + yeni sınıflandırma ekle
                  </button>
                </div>

                <div>
                  <label className={label}>Yetkili Kişi</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inp}
                      value={form.authorizedPerson}
                      onChange={(e) => setF("authorizedPerson", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={label}>E-Posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inp}
                      type="email"
                      value={form.email}
                      onChange={(e) => setF("email", e.target.value)}
                      placeholder="isteğe bağlı"
                    />
                  </div>
                </div>

                <div>
                  <label className={label}>Telefon 1</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inp}
                      value={form.phone1}
                      onChange={(e) => setF("phone1", e.target.value)}
                      placeholder="isteğe bağlı"
                    />
                  </div>
                </div>
                <div>
                  <label className={label}>Telefon 2</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className={inp}
                      value={form.phone2}
                      onChange={(e) => setF("phone2", e.target.value)}
                      placeholder="isteğe bağlı"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={label}>Resim</label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 transition hover:border-sky-300 hover:bg-sky-50/40">
                  <Camera className="mb-2 h-12 w-12 text-sky-500" />
                  <span className="text-sm font-bold text-sky-600">Resim Ekle</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImage}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Yükleniyor…
                    </span>
                  ) : null}
                </label>
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="mt-3 max-h-40 w-full rounded-lg border border-slate-200 object-contain"
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl space-y-4">
              <div className="grid gap-2 md:grid-cols-[100px_1fr] md:items-start">
                <label className="pt-2.5 text-sm font-semibold text-amber-900/90">
                  Adres
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-400"
                  value={form.address}
                  onChange={(e) => setF("address", e.target.value)}
                  rows={5}
                />
              </div>
              <div className="grid gap-2 md:grid-cols-[100px_1fr] md:items-start">
                <label className="pt-2.5 text-sm font-semibold text-amber-900/90">
                  Not
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-400"
                  value={form.note}
                  onChange={(e) => setF("note", e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </form>

      {addOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-800">
              Yeni sınıflandırma ({addKind === "FIHRIST_1" ? "1" : "2"})
            </h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitAddClass(e);
                  }
                }}
                placeholder="Ad"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={(e) => submitAddClass(e)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
