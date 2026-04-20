"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  UserCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

function statusLabel(status) {
  if (status === "ACTIVE") return "AKTİF";
  if (status === "ON_LEAVE") return "İZİNLİ";
  if (status === "REMOTE") return "UZAKTAN";
  return "AYRILDI";
}

function statusClass(status) {
  if (status === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "ON_LEAVE") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "REMOTE") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-100 text-slate-500";
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const employeeId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [docs, setDocs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [form, setForm] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    tcNo: "",
    departmentId: "",
    salary: "",
    startDate: "",
    status: "ACTIVE",
    performance: 100,
    performanceNotes: "",
    kpiTargets: "",
  });

  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [evalForm, setEvalForm] = useState({
    reviewDate: "",
    periodLabel: "",
    overallScore: 80,
    teamwork: "",
    quality: "",
    punctuality: "",
    strengths: "",
    improvements: "",
  });
  const [savingEval, setSavingEval] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadAll = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [empRes, deptRes, docsRes, evalRes] = await Promise.all([
        fetch(`/api/business/employees/${employeeId}`, { cache: "no-store" }),
        fetch("/api/business/departments", { cache: "no-store" }),
        fetch(`/api/business/employees/${employeeId}/documents`, { cache: "no-store" }),
        fetch(`/api/business/employees/${employeeId}/evaluations`, { cache: "no-store" }),
      ]);

      const empData = await empRes.json().catch(() => ({}));
      if (!empRes.ok) throw new Error(empData.error || "Çalışan yüklenemedi.");

      const deptData = await deptRes.json().catch(() => ({}));
      const deptList = deptRes.ok && Array.isArray(deptData.departments) ? deptData.departments : [];

      const docsData = await docsRes.json().catch(() => ({}));
      const docItems = docsRes.ok && Array.isArray(docsData.items) ? docsData.items : [];

      const evalData = await evalRes.json().catch(() => ({}));
      const evalItems = evalRes.ok && Array.isArray(evalData.items) ? evalData.items : [];

      setEmployee(empData);
      setDepartments(deptList);
      setDocs(docItems);
      setEvaluations(evalItems);

      setForm({
        name: empData.name || "",
        position: empData.position || "",
        email: empData.email || "",
        phone: empData.phone || "",
        tcNo: empData.tcNo || "",
        departmentId: empData.departmentRefId || empData.departmentId || "",
        salary: String(empData.salary ?? ""),
        startDate: toDateInputValue(empData.startDate),
        status: empData.status || "ACTIVE",
        performance: Number(empData.performance) || 0,
        performanceNotes: empData.performanceNotes || "",
        kpiTargets: empData.kpiTargets || "",
      });

      const today = toDateInputValue(new Date().toISOString());
      setEvalForm((prev) => ({ ...prev, reviewDate: today }));
    } catch (e) {
      toast.error(e.message || "Veri yüklenemedi.");
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveGeneral = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/business/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          position: form.position.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          tcNo: form.tcNo.trim() || null,
          departmentId: form.departmentId || null,
          salary: form.salary,
          startDate: form.startDate,
          status: form.status,
          performance: form.performance,
          performanceNotes: form.performanceNotes || null,
          kpiTargets: form.kpiTargets || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi.");
      setEmployee(data);
      toast.success("Bilgiler güncellendi.");
    } catch (err) {
      toast.error(err.message || "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file || !employeeId) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "GALLERY");
      const uploadRes = await fetch("/api/business/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.message || "Yükleme başarısız.");

      const patchRes = await fetch(`/api/business/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: uploadData.url }),
      });
      const patchData = await patchRes.json().catch(() => ({}));
      if (!patchRes.ok) throw new Error(patchData.error || "Profil güncellenemedi.");

      setEmployee(patchData);
      toast.success("Profil fotoğrafı güncellendi.");
    } catch (err) {
      toast.error(err.message || "Fotoğraf yüklenemedi.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadDocument = async () => {
    if (!docFile || !employeeId) {
      toast.error("Dosya seçiniz.");
      return;
    }
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("file", docFile);
      fd.append("type", "DOCUMENT");
      const uploadRes = await fetch("/api/business/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.message || "Yükleme başarısız.");

      const createRes = await fetch(`/api/business/employees/${employeeId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle || docFile.name || "Belge",
          url: uploadData.url,
          fileId: uploadData?.media?.fileId || null,
          mimeType: docFile.type || null,
          sizeBytes: typeof docFile.size === "number" ? docFile.size : null,
        }),
      });
      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok) throw new Error(createData.error || "Belge kaydedilemedi.");

      setDocTitle("");
      setDocFile(null);
      await loadAll();
      toast.success("Evrak eklendi.");
    } catch (err) {
      toast.error(err.message || "Belge yüklenemedi.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!confirm("Belge silinsin mi?")) return;
    try {
      const res = await fetch(`/api/business/employees/${employeeId}/documents/${docId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Silme başarısız.");
      await loadAll();
      toast.success("Belge silindi.");
    } catch (err) {
      toast.error(err.message || "Silme başarısız.");
    }
  };

  const submitEvaluation = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    setSavingEval(true);
    try {
      const criteria = {};
      const t = parseInt(String(evalForm.teamwork), 10);
      const q = parseInt(String(evalForm.quality), 10);
      const p = parseInt(String(evalForm.punctuality), 10);
      if (Number.isFinite(t) && t >= 1 && t <= 5) criteria.teamwork = t;
      if (Number.isFinite(q) && q >= 1 && q <= 5) criteria.quality = q;
      if (Number.isFinite(p) && p >= 1 && p <= 5) criteria.punctuality = p;

      const res = await fetch(`/api/business/employees/${employeeId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewDate: evalForm.reviewDate || undefined,
          periodLabel: evalForm.periodLabel.trim() || null,
          overallScore: evalForm.overallScore,
          criteriaJson: Object.keys(criteria).length ? criteria : null,
          strengths: evalForm.strengths.trim() || null,
          improvements: evalForm.improvements.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Değerlendirme kaydedilemedi.");

      setEvalForm((prev) => ({
        ...prev,
        periodLabel: "",
        strengths: "",
        improvements: "",
        teamwork: "",
        quality: "",
        punctuality: "",
      }));
      await loadAll();
      toast.success("Değerlendirme kaydedildi.");
    } catch (err) {
      toast.error(err.message || "Kayıt başarısız.");
    } finally {
      setSavingEval(false);
    }
  };

  const tabs = useMemo(
    () => [
      { id: "general", label: "Genel bilgiler" },
      { id: "docs", label: "Evraklar" },
      { id: "eval", label: "Değerlendirme" },
    ],
    [],
  );

  if (!employeeId) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-600">Geçersiz çalışan bağlantısı.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <Link
          href="/business/employees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Listeye dön
        </Link>
        <p className="mt-4 text-sm text-slate-600">Çalışan bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pb-16 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href="/business/employees"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Listeye dön
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-200/90 text-slate-500">
              {employee.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employee.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserCircleIcon className="h-11 w-11" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{employee.name}</h1>
              <p className="text-sm font-medium text-slate-500">{employee.position}</p>
              <p className="mt-1 text-sm text-slate-600">{employee.department || "Departman yok"}</p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusClass(
                employee.status,
              )}`}
            >
              {statusLabel(employee.status)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:w-72">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Maaş</p>
            <p className="mt-1 text-lg font-bold text-slate-900">₺{formatMoney(employee.salary)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Performans</p>
            <p className="mt-1 text-lg font-bold text-slate-900">%{employee.performance ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Genel bilgiler</h2>
          <p className="mt-1 text-sm text-slate-500">
            İletişim, departman, performans ve notlar. Profil fotoğrafı için resim yükleyin (jpeg, png, webp).
          </p>

          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-100 bg-slate-50 p-5 rounded-2xl">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              {employee.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employee.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserCircleIcon className="h-14 w-14 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800">Profil Fotoğrafı</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
                JPEG, PNG veya WebP formatında fotoğraf yükleyebilirsiniz. İdeal boyut 400x400 pikseldir (Maks 5 MB).
              </p>
              <div className="mt-4 flex items-center gap-3">
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 hover:border-sky-300 ${
                    uploadingAvatar ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <PhotoIcon className="h-4 w-4" />
                  {uploadingAvatar ? "Yükleniyor..." : "Yeni Fotoğraf Seç"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingAvatar}
                    className="hidden"
                    onChange={(ev) => {
                      const f = ev.target.files?.[0];
                      ev.target.value = "";
                      if (f) uploadAvatar(f);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <form className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={saveGeneral}>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Ad Soyad</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Pozisyon</span>
              <input
                required
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">E-posta</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Telefon</span>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">TC Kimlik No</span>
              <input
                value={form.tcNo}
                onChange={(e) => setForm((p) => ({ ...p, tcNo: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Departman</span>
              <select
                value={form.departmentId}
                onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="">Seçiniz</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Net maaş</span>
              <input
                type="number"
                step="0.01"
                value={form.salary}
                onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">İşe giriş</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Durum</span>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="ON_LEAVE">İzinli</option>
                <option value="REMOTE">Uzaktan</option>
                <option value="TERMINATED">Ayrıldı</option>
              </select>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Performans (0–100)
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={form.performance}
                onChange={(e) => setForm((p) => ({ ...p, performance: Number(e.target.value) }))}
                className="w-full"
              />
              <div className="text-sm font-semibold text-slate-800">%{form.performance}</div>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Performans notları</span>
              <textarea
                rows={4}
                value={form.performanceNotes}
                onChange={(e) => setForm((p) => ({ ...p, performanceNotes: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">KPI / hedefler</span>
              <textarea
                rows={4}
                value={form.kpiTargets}
                onChange={(e) => setForm((p) => ({ ...p, kpiTargets: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {tab === "docs" ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Evraklar</h2>
          <p className="mt-1 text-sm text-slate-500">PDF veya ofis belgeleri yükleyebilirsiniz (en fazla 5 MB).</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Başlık</span>
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Opsiyonel"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Dosya</span>
              <input
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={uploadDocument}
            disabled={uploadingDoc}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <DocumentArrowUpIcon className="h-5 w-5" />
            {uploadingDoc ? "Yükleniyor…" : "Yükle ve kaydet"}
          </button>

          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4">Başlık</th>
                  <th className="py-3 pr-4">Tarih</th>
                  <th className="py-3 pr-4">Boyut</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Henüz evrak yok.
                    </td>
                  </tr>
                ) : (
                  docs.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-800">
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          {d.title}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{formatDateTime(d.createdAt)}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {d.sizeBytes != null ? `${Math.round(d.sizeBytes / 1024)} KB` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteDocument(d.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "eval" ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <h2 className="text-lg font-bold text-slate-900">Değerlendirme</h2>
          <p className="mt-1 text-sm text-slate-500">
            Genel puan 0–100; isteğe bağlı kriterler 1–5 (takım çalışması, kalite, zamanlama).
          </p>

          <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submitEvaluation}>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Değerlendirme tarihi</span>
              <input
                type="date"
                required
                value={evalForm.reviewDate}
                onChange={(e) => setEvalForm((p) => ({ ...p, reviewDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Dönem etiketi</span>
              <input
                value={evalForm.periodLabel}
                onChange={(e) => setEvalForm((p) => ({ ...p, periodLabel: e.target.value }))}
                placeholder="Örn. Q1 2026"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Genel puan (0–100)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={evalForm.overallScore}
                onChange={(e) => setEvalForm((p) => ({ ...p, overallScore: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Takım (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={evalForm.teamwork}
                  onChange={(e) => setEvalForm((p) => ({ ...p, teamwork: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-sm outline-none focus:border-slate-400"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Kalite (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={evalForm.quality}
                  onChange={(e) => setEvalForm((p) => ({ ...p, quality: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-sm outline-none focus:border-slate-400"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Zaman (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={evalForm.punctuality}
                  onChange={(e) => setEvalForm((p) => ({ ...p, punctuality: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-sm outline-none focus:border-slate-400"
                />
              </label>
            </div>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Güçlü yönler</span>
              <textarea
                rows={3}
                value={evalForm.strengths}
                onChange={(e) => setEvalForm((p) => ({ ...p, strengths: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Gelişim alanları</span>
              <textarea
                rows={3}
                value={evalForm.improvements}
                onChange={(e) => setEvalForm((p) => ({ ...p, improvements: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingEval}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {savingEval ? "Kaydediliyor…" : "Değerlendirme ekle"}
              </button>
            </div>
          </form>

          <div className="mt-10 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4">Tarih</th>
                  <th className="py-3 pr-4">Dönem</th>
                  <th className="py-3 pr-4">Puan</th>
                  <th className="py-3 pr-4">Kriterler</th>
                  <th className="py-3">Özet</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Kayıt yok.
                    </td>
                  </tr>
                ) : (
                  evaluations.map((ev) => (
                    <tr key={ev.id} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 text-slate-700">{formatDateTime(ev.reviewDate)}</td>
                      <td className="py-3 pr-4 text-slate-700">{ev.periodLabel || "—"}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-900">{ev.overallScore}</td>
                      <td className="py-3 pr-4 text-xs text-slate-600">
                        {ev.criteriaJson && typeof ev.criteriaJson === "object"
                          ? Object.entries(ev.criteriaJson)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="py-3 text-slate-600">
                        <div className="max-w-xs space-y-1 text-xs">
                          {ev.strengths ? (
                            <p>
                              <span className="font-semibold text-slate-800">Güçlü: </span>
                              {ev.strengths}
                            </p>
                          ) : null}
                          {ev.improvements ? (
                            <p>
                              <span className="font-semibold text-slate-800">Gelişim: </span>
                              {ev.improvements}
                            </p>
                          ) : null}
                          {!ev.strengths && !ev.improvements ? "—" : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
