"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  X,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addDays,
} from "date-fns";
import { tr } from "date-fns/locale";

const WEEKDAY_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const JS_DAY_TO_ENUM = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  0: "SUNDAY",
};

function hmToMinutes(hm) {
  if (typeof hm !== "string" || !hm.includes(":")) return null;
  const [h, m] = hm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function minutesToHm(min) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export default function ReservationDrawer({
  isOpen,
  onClose,
  listing,
  sectorConfig,
  reservationStep,
  setReservationStep,
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  selectedGuests,
  setSelectedGuests,
  selectedTime,
  setSelectedTime,
  handleReservationSubmit,
  isSubmitting = false,
  referenceCode = "",
}) {
  if (!isOpen) return null;
  const terms = sectorConfig || {
    action: "Rezervasyon Yap",
    step1Title: "Kaç kişi olacaksınız?",
    unit: "Kişi",
    successTitle: "Rezervasyon Talebiniz",
    typeTag: "Rezervasyon",
    showGuests: true,
  };

  const reservationConfig = listing?.reservationConfig || null;
  const slotDuration = reservationConfig?.slotDurationMin || 60;
  const minNoticeMinutes = reservationConfig?.minNoticeMinutes || 0;
  const maxAdvanceDays = reservationConfig?.maxAdvanceDays || 60;
  const availability = Array.isArray(reservationConfig?.availability)
    ? reservationConfig.availability
    : [];
  const questions = Array.isArray(reservationConfig?.questions)
    ? reservationConfig.questions
    : [];

  const [formValues, setFormValues] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });
  const [questionAnswers, setQuestionAnswers] = useState({});

  const availableDaySet = useMemo(
    () => new Set(availability.map((slot) => slot.dayOfWeek)),
    [availability],
  );

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayEnum = JS_DAY_TO_ENUM[selectedDate.getDay()];
    return availability.filter((slot) => slot.dayOfWeek === dayEnum);
  }, [selectedDate, availability]);

  const availableTimes = useMemo(() => {
    if (!selectedDate || selectedDaySlots.length === 0) return [];
    const now = new Date();
    const minAllowedMs = now.getTime() + minNoticeMinutes * 60 * 1000;
    const dateAtMidnight = new Date(selectedDate);
    dateAtMidnight.setHours(0, 0, 0, 0);
    const times = [];

    for (const slot of selectedDaySlots) {
      const start = hmToMinutes(slot.startTime);
      const end = hmToMinutes(slot.endTime);
      if (start == null || end == null || end <= start) continue;
      for (let t = start; t + slotDuration <= end; t += slotDuration) {
        const startDate = new Date(dateAtMidnight);
        startDate.setMinutes(t, 0, 0);
        if (startDate.getTime() < minAllowedMs) continue;
        times.push(minutesToHm(t));
      }
    }

    return [...new Set(times)].sort();
  }, [selectedDate, selectedDaySlots, slotDuration, minNoticeMinutes]);

  const maxAllowedDate = useMemo(() => addDays(new Date(), maxAdvanceDays), [maxAdvanceDays]);

  const isDateSelectable = (date) => {
    const dayEnum = JS_DAY_TO_ENUM[date.getDay()];
    if (!availableDaySet.has(dayEnum)) return false;
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (normalized < today) return false;
    return normalized <= maxAllowedDate;
  };

  const buildReservationDates = () => {
    if (!selectedDate || !selectedTime) return { startAt: null, endAt: null };
    const [hourStr, minuteStr] = selectedTime.split(":");
    const startAt = new Date(selectedDate);
    startAt.setHours(Number(hourStr) || 0, Number(minuteStr) || 0, 0, 0);
    const endAt = new Date(startAt.getTime() + slotDuration * 60 * 1000);
    return { startAt, endAt };
  };

  const onSubmitReservation = async (e) => {
    e.preventDefault();
    const { startAt, endAt } = buildReservationDates();
    if (!startAt || !endAt) return;
    const mappedAnswers = Object.entries(questionAnswers).map(([questionId, value]) => ({
      questionId,
      value,
    }));
    const result = await handleReservationSubmit?.({
      ...formValues,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      serviceName: terms.typeTag || "Rezervasyon",
      questionAnswers: mappedAnswers,
    });
    if (result?.ok !== true && result?.error) {
      toast.error(result.error);
    }
  };

  const renderQuestionField = (q) => {
    const value = questionAnswers[q.id];
    if (q.type === "TEXT") {
      return (
        <textarea
          rows={3}
          required={Boolean(q.isRequired)}
          value={String(value || "")}
          onChange={(e) =>
            setQuestionAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
          }
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          placeholder="Cevabınızı yazın"
        />
      );
    }
    if (q.type === "SHORT_ANSWER") {
      return (
        <input
          required={Boolean(q.isRequired)}
          value={String(value || "")}
          onChange={(e) =>
            setQuestionAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
          }
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          placeholder="Kısa cevap"
        />
      );
    }
    if (q.type === "SINGLE_CHOICE") {
      return (
        <div className="space-y-2">
          {(q.options || []).map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={value === opt.id}
                onChange={() =>
                  setQuestionAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {(q.options || []).map((opt) => {
          const selected = Array.isArray(value) ? value : [];
          const checked = selected.includes(opt.id);
          return (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  const current = Array.isArray(selected) ? selected : [];
                  const next = e.target.checked
                    ? [...current, opt.id]
                    : current.filter((item) => item !== opt.id);
                  setQuestionAnswers((prev) => ({ ...prev, [q.id]: next }));
                }}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[99999] bg-white flex flex-col lg:flex-row overflow-hidden h-[100dvh] w-full"
      >
        <div className="hidden lg:flex lg:w-1/3 bg-slate-900 text-white flex-col relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={listing?.coverImage} alt="" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-900/50" />
          </div>
          <div className="relative z-10 p-8 flex flex-col h-full">
            <button type="button" onClick={onClose} className="self-start text-white/60 hover:text-white flex items-center gap-2 transition-colors mb-8">
              <ArrowLeft className="w-5 h-5" /> İptal et
            </button>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                {terms.typeTag}
              </span>
              <h2 className="text-3xl font-bold mb-2 leading-tight">{listing?.title}</h2>
              <p className="text-slate-400 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" /> {listing?.location}
              </p>
            </div>
            <div className="mt-auto space-y-4">
              <div className="p-4 rounded-xl border bg-white/10 border-white/20">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tarih {terms.showGuests ? "& Kişi" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="font-semibold">
                    {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: tr }) : "Seçilmedi"}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-white/10 border-white/20">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Saat</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="font-semibold">{selectedTime || "Seçilmedi"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="shrink-0 p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3 lg:hidden">
              <button type="button" onClick={onClose} className="p-2 -ml-2 text-slate-500">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="font-semibold text-slate-900">{listing?.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Adım {reservationStep}/3</span>
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hidden lg:block">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
              {reservationStep === 1 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  {terms.showGuests && (
                    <section>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">1. {terms.step1Title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, "8+"].map((num) => {
                          const val = num === "8+" ? 9 : num;
                          const isSelected = selectedGuests === val;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setSelectedGuests(val)}
                              className={`w-12 h-12 rounded-xl font-semibold flex items-center justify-center transition-colors ${
                                isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      {terms.showGuests ? "2. " : ""}Ne zaman gelmek istersiniz?
                    </h3>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-slate-100">
                          <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <span className="font-semibold text-slate-900 capitalize">{format(currentMonth, "MMMM yyyy", { locale: tr })}</span>
                        <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-slate-100">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {WEEKDAY_SHORT.map((day) => (
                          <div key={day} className="text-xs font-semibold text-slate-400">
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                          <div key={`e-${i}`} />
                        ))}
                        {eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).map((date) => {
                          const isSelected = selectedDate && isSameDay(date, selectedDate);
                          const selectable = isDateSelectable(date);
                          return (
                            <button
                              key={date.toISOString()}
                              type="button"
                              disabled={!selectable}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedTime(null);
                              }}
                              className={`h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                isSelected
                                  ? "bg-slate-900 text-white"
                                  : !selectable
                                    ? "text-slate-300 cursor-not-allowed"
                                    : isToday(date)
                                      ? "ring-2 ring-slate-900 ring-inset text-slate-900"
                                      : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {format(date, "d")}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {reservationStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">Müsait saat</h3>
                  {availableTimes.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      Seçilen gün için uygun saat bulunamadı.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors ${
                            selectedTime === time
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-100 text-slate-600 hover:border-slate-200"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {reservationStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">İletişim bilgileri</h3>
                  <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {terms.successTitle}nızın onaylanması için iletişim bilgilerinizi girin.
                    </p>
                  </div>
                  <form id="reservation-form" onSubmit={onSubmitReservation} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Ad Soyad</label>
                        <input
                          required
                          type="text"
                          value={formValues.customerName}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, customerName: e.target.value }))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Telefon</label>
                        <input
                          required
                          type="tel"
                          value={formValues.customerPhone}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, customerPhone: e.target.value }))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                          placeholder="0555 555 55 55"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">E-posta (opsiyonel)</label>
                      <input
                        type="email"
                        value={formValues.customerEmail}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                        placeholder="ornek@email.com"
                      />
                    </div>

                    {questions.length > 0 && (
                      <div className="space-y-4 pt-1">
                        <h4 className="text-sm font-bold text-slate-800">Ek Sorular</h4>
                        {questions.map((q) => (
                          <div key={q.id}>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                              {q.label} {q.isRequired ? "*" : ""}
                            </label>
                            {renderQuestionField(q)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Özel istekler</label>
                      <textarea
                        rows={3}
                        value={formValues.notes}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, notes: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none text-sm"
                        placeholder="Alerji, masa tercihi vb."
                      />
                    </div>
                  </form>
                </motion.div>
              )}

              {reservationStep === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Talebiniz alındı</h2>
                  <p className="text-slate-600 max-w-sm mx-auto mb-6">
                    {terms.successTitle}. Onay mesajı telefonunuza gönderilecektir.
                  </p>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full max-w-sm mb-6 text-left">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                      <span className="text-slate-500 text-sm font-medium">Referans kodu</span>
                      <span className="font-mono font-bold text-slate-900 tracking-wider">#{referenceCode || "RES-..."}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tarih</span>
                        <span className="font-semibold text-slate-900">
                          {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: tr }) : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Saat</span>
                        <span className="font-semibold text-slate-900">{selectedTime}</span>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={onClose} className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                    Tamamla
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {reservationStep < 4 && (
            <div className="shrink-0 p-4 lg:p-6 border-t border-slate-100 bg-white">
              <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                <div>
                  {reservationStep > 1 && (
                    <button type="button" onClick={() => setReservationStep(reservationStep - 1)} className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-900">
                      Geri
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (reservationStep === 3) {
                      const form = document.getElementById("reservation-form");
                      if (form) form.requestSubmit();
                    } else {
                      setReservationStep(reservationStep + 1);
                    }
                  }}
                  disabled={(reservationStep === 1 && !selectedDate) || (reservationStep === 2 && !selectedTime) || isSubmitting}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  {reservationStep === 3
                    ? isSubmitting
                      ? "Gönderiliyor..."
                      : `${terms.action}ı tamamla`
                    : "Devam"}{" "}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
