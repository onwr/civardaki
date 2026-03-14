"use client";

import { useState, useEffect, useCallback } from "react";
import { X, User, Store, Shield, Activity, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatLastLogin, safeStr } from "@/lib/admin-users/formatters";
import { getRoleLabel, getStatusLabel, getRoleBadgeClass, getStatusBadgeClass } from "@/lib/admin-users/status-config";
import ConfirmUserActionModal from "./ConfirmUserActionModal";

const TABS = [
  { id: "general", label: "Genel Bilgiler", icon: User },
  { id: "security", label: "Güvenlik / Hesap Durumu", icon: Shield },
  { id: "business", label: "İşletme Bilgisi", icon: Store },
  { id: "activity", label: "Aktivite / Son Giriş", icon: Activity },
  { id: "notes", label: "Admin Notları", icon: FileText },
];

export default function UserDetailDrawer({ userId, open, onClose, onUserUpdated }) {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editGeneral, setEditGeneral] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "", status: "" });
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", status: null, loading: false });
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [notesSubmitting, setNotesSubmitting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setEditForm({
          name: data.user.name ?? "",
          email: data.user.email ?? "",
          phone: data.user.phone ?? "",
          role: data.user.role ?? "USER",
          status: data.user.status ?? "ACTIVE",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      fetchDetail();
      setActiveTab("general");
      setEditGeneral(false);
    }
  }, [open, userId, fetchDetail]);

  const fetchNotes = useCallback(() => {
    if (!userId) return;
    setNotesLoading(true);
    fetch(`/api/admin/users/${userId}/notes`)
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []))
      .catch(() => setNotes([]))
      .finally(() => setNotesLoading(false));
  }, [userId]);

  useEffect(() => {
    if (open && userId && activeTab === "notes") fetchNotes();
  }, [open, userId, activeTab, fetchNotes]);

  const handlePatch = useCallback(
    async (body) => {
      if (!userId) return;
      setSaving(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");
        toast.success("Güncellendi.");
        await fetchDetail();
        onUserUpdated?.();
        setEditGeneral(false);
      } catch (e) {
        toast.error(e.message || "Güncelleme başarısız.");
      } finally {
        setSaving(false);
      }
    },
    [userId, fetchDetail, onUserUpdated]
  );

  const handleSaveGeneral = () => {
    handlePatch({
      name: editForm.name.trim(),
      email: editForm.email.trim() || undefined,
      phone: editForm.phone.trim() || null,
      role: editForm.role,
      status: editForm.status,
    });
  };

  const handleStatusChange = useCallback(
    (status) => {
      setConfirm({
        open: true,
        title: `Durumu "${getStatusLabel(status)}" yap`,
        message: "Bu işlemi onaylıyor musunuz?",
        status,
        loading: false,
      });
    },
    []
  );

  const confirmStatus = useCallback(async () => {
    if (!confirm.status || !userId) return;
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirm.status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");
      toast.success("Durum güncellendi.");
      await fetchDetail();
      onUserUpdated?.();
    } catch (e) {
      toast.error(e.message || "Güncelleme başarısız.");
    } finally {
      setConfirm((c) => ({ ...c, open: false, loading: false, status: null }));
    }
  }, [userId, confirm.status, fetchDetail, onUserUpdated]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" aria-hidden onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-xl z-50 flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-semibold">
              {user?.image ? (
                <img src={user.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                (user?.name || "?").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900 truncate">{user ? safeStr(user.name) : "Kullanıcı detayı"}</h2>
              <p className="text-xs text-slate-500 truncate">{user?.email ?? userId}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 overflow-x-auto shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && !user ? (
            <p className="text-slate-500">Yükleniyor...</p>
          ) : (
            <>
              {activeTab === "general" && (
                <div className="space-y-4">
                  {!editGeneral ? (
                    <>
                      <dl className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <dt className="text-slate-500">Ad</dt>
                          <dd className="font-medium text-slate-900">{safeStr(user?.name)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">E-posta</dt>
                          <dd className="font-medium text-slate-900">{safeStr(user?.email)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Telefon</dt>
                          <dd className="font-medium text-slate-900">{safeStr(user?.phone)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Rol</dt>
                          <dd>
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadgeClass(user?.role)}`}>
                              {getRoleLabel(user?.role)}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Durum</dt>
                          <dd>
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(user?.status)}`}>
                              {getStatusLabel(user?.status)}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">E-posta doğrulandı</dt>
                          <dd className="font-medium text-slate-900">{user?.emailVerified ? "Evet" : "Hayır"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Kayıt tarihi</dt>
                          <dd className="font-medium text-slate-900">{formatDateTime(user?.createdAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Son güncelleme</dt>
                          <dd className="font-medium text-slate-900">{formatDateTime(user?.updatedAt)}</dd>
                        </div>
                      </dl>
                      <button
                        type="button"
                        onClick={() => setEditGeneral(true)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                      >
                        Düzenle
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200"
                        >
                          <option value="USER">Müşteri</option>
                          <option value="BUSINESS">İşletme</option>
                          <option value="ADMIN">Yönetici</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200"
                        >
                          <option value="ACTIVE">Aktif</option>
                          <option value="SUSPENDED">Askıda</option>
                          <option value="BANNED">Yasaklı</option>
                          <option value="PENDING">Beklemede</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditGeneral(false)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700"
                        >
                          İptal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveGeneral}
                          disabled={saving}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4">
                  <dl className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">E-posta doğrulandı</dt>
                      <dd className="font-medium text-slate-900">{user?.emailVerified ? "Evet" : "Hayır"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Hesap durumu</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(user?.status)}`}>
                          {getStatusLabel(user?.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Son giriş</dt>
                      <dd className="font-medium text-slate-900">{formatLastLogin(user?.lastLoginAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Kayıt tarihi</dt>
                      <dd className="font-medium text-slate-900">{formatDateTime(user?.createdAt)}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    {user?.status !== "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("ACTIVE")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                      >
                        Aktif yap
                      </button>
                    )}
                    {user?.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("SUSPENDED")}
                        className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
                      >
                        Askıya al
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStatusChange("BANNED")}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                    >
                      Yasakla
                    </button>
                    {user?.status === "BANNED" && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange("ACTIVE")}
                        className="px-4 py-2 rounded-xl bg-slate-600 text-white text-sm font-medium hover:bg-slate-700"
                      >
                        Yasak kaldır
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div className="space-y-4">
                  {user?.business ? (
                    <>
                      <dl className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <dt className="text-slate-500">İşletme adı</dt>
                          <dd className="font-medium text-slate-900">{user.business.name}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Slug</dt>
                          <dd className="font-medium text-slate-900">{user.business.slug}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Durum</dt>
                          <dd className="font-medium text-slate-900">{user.business.isActive ? "Aktif" : "Pasif"}</dd>
                        </div>
                        {user.business.businesssubscription && (
                          <div>
                            <dt className="text-slate-500">Abonelik</dt>
                            <dd className="font-medium text-slate-900">
                              {user.business.businesssubscription.status} / {user.business.businesssubscription.plan ?? "—"} —{" "}
                              {user.business.businesssubscription.expiresAt
                                ? formatDate(user.business.businesssubscription.expiresAt)
                                : "—"}
                            </dd>
                          </div>
                        )}
                      </dl>
                      <Link
                        href={`/admin/businesses?highlight=${user.business.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      >
                        <Store className="w-4 h-4" /> Admin'de işletme aç
                      </Link>
                    </>
                  ) : (
                    <p className="text-slate-500">Bağlı işletme yok.</p>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Son giriş</dt>
                    <dd className="font-medium text-slate-900">{formatLastLogin(user?.lastLoginAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Kayıt tarihi</dt>
                    <dd className="font-medium text-slate-900">{formatDateTime(user?.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Son güncelleme</dt>
                    <dd className="font-medium text-slate-900">{formatDateTime(user?.updatedAt)}</dd>
                  </div>
                </dl>
              )}

              {activeTab === "notes" && (
                <div className="space-y-6">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const text = newNote.trim();
                      if (!text || !userId) return;
                      setNotesSubmitting(true);
                      try {
                        const res = await fetch(`/api/admin/users/${userId}/notes`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ note: text }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Kaydetme başarısız.");
                        toast.success("Not eklendi.");
                        setNewNote("");
                        fetchNotes();
                      } catch (err) {
                        toast.error(err.message || "Kaydetme başarısız.");
                      } finally {
                        setNotesSubmitting(false);
                      }
                    }}
                    className="space-y-2"
                  >
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Yeni not</label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Kullanıcı ile ilgili iç not..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-300 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={notesSubmitting || !newNote.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {notesSubmitting ? "Ekleniyor..." : "Not ekle"}
                    </button>
                  </form>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Toplam <strong>{notes.length}</strong> not.</p>
                    {notesLoading ? (
                      <p className="text-slate-500">Yükleniyor...</p>
                    ) : notes.length === 0 ? (
                      <p className="text-slate-500">Henüz not yok.</p>
                    ) : (
                      <ul className="space-y-3">
                        {notes.map((n) => (
                          <li key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                            <p className="text-slate-800 whitespace-pre-wrap">{n.note}</p>
                            <p className="mt-2 text-xs text-slate-500">
                              {n.author?.name ?? n.author?.email ?? "Sistem"} — {formatDateTime(n.createdAt)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {confirm.open && (
        <ConfirmUserActionModal
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          loading={confirm.loading}
          onConfirm={confirmStatus}
          onCancel={() => setConfirm((c) => ({ ...c, open: false }))}
        />
      )}
    </>
  );
}
