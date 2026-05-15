"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  X,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle,
  Info,
  Users,
  CalendarCheck,
  MessageSquare,
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

const ALL_WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

/** İşletme müsaitlik tanımlamadıysa hafta içi 09–18 */
const DEFAULT_AVAILABILITY = ALL_WEEKDAYS.map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "18:00",
}));

const DAY_ALIASES = {
  monday: "MONDAY",
  mon: "MONDAY",
  pazartesi: "MONDAY",
  tuesday: "TUESDAY",
  tue: "TUESDAY",
  salı: "TUESDAY",
  sali: "TUESDAY",
  wednesday: "WEDNESDAY",
  wed: "WEDNESDAY",
  çarşamba: "WEDNESDAY",
  carsamba: "WEDNESDAY",
  thursday: "THURSDAY",
  thu: "THURSDAY",
  perşembe: "THURSDAY",
  persembe: "THURSDAY",
  friday: "FRIDAY",
  fri: "FRIDAY",
  cuma: "FRIDAY",
  saturday: "SATURDAY",
  sat: "SATURDAY",
  cumartesi: "SATURDAY",
  sunday: "SUNDAY",
  sun: "SUNDAY",
  pazar: "SUNDAY",
};

function normalizeDayOfWeek(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (ALL_WEEKDAYS.includes(upper)) return upper;
  const fromAlias = DAY_ALIASES[raw.toLowerCase()];
  if (fromAlias) return fromAlias;
  const asNum = Number(raw);
  if (!Number.isNaN(asNum) && JS_DAY_TO_ENUM[asNum]) return JS_DAY_TO_ENUM[asNum];
  return null;
}

function normalizeAvailabilitySlots(slots) {
  if (!Array.isArray(slots)) return [];
  return slots
    .map((slot) => {
      const dayOfWeek = normalizeDayOfWeek(slot?.dayOfWeek);
      if (!dayOfWeek) return null;
      return { ...slot, dayOfWeek };
    })
    .filter(Boolean);
}

function startOfCalendarDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthGridLeadingEmptyCount(monthDate) {
  const first = startOfMonth(monthDate);
  return (first.getDay() + 6) % 7;
}

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

  const rawAvailability = Array.isArray(reservationConfig?.availability)
    ? reservationConfig.availability
    : [];

  const normalizedAvailability = useMemo(
    () => normalizeAvailabilitySlots(rawAvailability),
    [rawAvailability],
  );

  const hasBusinessAvailability = normalizedAvailability.length > 0;

  const effectiveAvailability = hasBusinessAvailability
    ? normalizedAvailability
    : DEFAULT_AVAILABILITY;

  const [datePickerMode, setDatePickerMode] = useState("quick");

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
    () => new Set(effectiveAvailability.map((slot) => slot.dayOfWeek)),
    [effectiveAvailability],
  );

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayEnum = JS_DAY_TO_ENUM[selectedDate.getDay()];
    return effectiveAvailability.filter((slot) => slot.dayOfWeek === dayEnum);
  }, [selectedDate, effectiveAvailability]);

  const quickPickDates = useMemo(() => {
    const list = [];
    const today = startOfCalendarDay(new Date());
    for (let i = 0; i < 21; i += 1) {
      list.push(addDays(today, i));
    }
    return list;
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    if (selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime())) return;
    const parsed = new Date(selectedDate);
    if (!Number.isNaN(parsed.getTime())) {
      setSelectedDate(startOfCalendarDay(parsed));
    }
  }, [selectedDate, setSelectedDate]);

  const availableTimes = useMemo(() => {
    if (!selectedDate || selectedDaySlots.length === 0) return [];

    const now = new Date();
    const minAllowedMs = now.getTime() + minNoticeMinutes * 60 * 1000;
    const dateAtMidnight = startOfCalendarDay(selectedDate);

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

  const maxAllowedDate = useMemo(
    () => addDays(new Date(), maxAdvanceDays),
    [maxAdvanceDays]
  );

  const isDateSelectable = (date) => {
    const dayEnum = JS_DAY_TO_ENUM[date.getDay()];
    if (!availableDaySet.has(dayEnum)) return false;

    const normalized = startOfCalendarDay(date);
    const today = startOfCalendarDay(new Date());
    const maxDay = startOfCalendarDay(maxAllowedDate);

    if (normalized < today) return false;
    return normalized <= maxDay;
  };

  const handleDatePick = (date) => {
    if (!isDateSelectable(date)) return;
    setSelectedDate(startOfCalendarDay(date));
    setSelectedTime(null);
    setCurrentMonth(startOfMonth(date));
  };

  const buildReservationDates = () => {
    if (!selectedDate || !selectedTime) {
      return { startAt: null, endAt: null };
    }

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

    const mappedAnswers = Object.entries(questionAnswers).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );

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
            setQuestionAnswers((prev) => ({
              ...prev,
              [q.id]: e.target.value,
            }))
          }
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#0057d9] focus:bg-white"
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
            setQuestionAnswers((prev) => ({
              ...prev,
              [q.id]: e.target.value,
            }))
          }
          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0057d9] focus:bg-white"
          placeholder="Kısa cevap"
        />
      );
    }

    if (q.type === "SINGLE_CHOICE") {
      return (
        <div className="space-y-2">
          {(q.options || []).map((opt) => {
            const checked = value === opt.id;

            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-bold transition ${
                  checked
                    ? "border-[#0057d9] bg-blue-50 text-slate-950"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={checked}
                  onChange={() =>
                    setQuestionAnswers((prev) => ({
                      ...prev,
                      [q.id]: opt.id,
                    }))
                  }
                  className="hidden"
                />

                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    checked
                      ? "border-[#0057d9] bg-[#0057d9]"
                      : "border-slate-300"
                  }`}
                >
                  {checked && <CheckCircle className="h-3 w-3 text-white" />}
                </span>

                {opt.label}
              </label>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {(q.options || []).map((opt) => {
          const selected = Array.isArray(value) ? value : [];
          const checked = selected.includes(opt.id);

          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-bold transition ${
                checked
                  ? "border-[#0057d9] bg-blue-50 text-slate-950"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  const current = Array.isArray(selected) ? selected : [];
                  const next = e.target.checked
                    ? [...current, opt.id]
                    : current.filter((item) => item !== opt.id);

                  setQuestionAnswers((prev) => ({
                    ...prev,
                    [q.id]: next,
                  }));
                }}
                className="hidden"
              />

              <span
                className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 ${
                  checked
                    ? "border-[#0057d9] bg-[#0057d9]"
                    : "border-slate-300"
                }`}
              >
                {checked && <CheckCircle className="h-3 w-3 text-white" />}
              </span>

              {opt.label}
            </label>
          );
        })}
      </div>
    );
  };

  const canContinue =
    reservationStep === 1
      ? Boolean(selectedDate)
      : reservationStep === 2
        ? Boolean(selectedTime)
        : true;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-y-0 right-0 flex w-full max-w-full flex-col overflow-hidden bg-[#f8fafc] shadow-2xl sm:max-w-[min(100%,760px)]"
          style={{ maxHeight: "100dvh" }}
        >
          {/* HEADER */}
          <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4 lg:px-7">
              <button
                type="button"
                onClick={reservationStep === 1 ? onClose : () => setReservationStep(reservationStep - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  {terms.typeTag || "Rezervasyon"}
                </p>
                <h2 className="mt-1 text-sm font-black text-slate-950">
                  {listing?.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reservationStep < 4 && (
              <div className="px-5 pb-4 lg:px-7">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-2 rounded-full ${
                        reservationStep >= step ? "bg-[#0057d9]" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-40 sm:px-5 sm:py-6 sm:pb-36 lg:px-7">
            {reservationStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <InfoCard listing={listing} terms={terms} />

                {terms.showGuests && (
                  <section className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950 sm:mb-5 sm:text-xl">
                      <Users className="h-5 w-5 shrink-0 text-[#0057d9]" />
                      {terms.step1Title}
                    </h3>

                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, "8+"].map((num) => {
                        const val = num === "8+" ? 9 : num;
                        const isSelected = selectedGuests === val;

                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSelectedGuests(val)}
                            className={`min-h-[48px] rounded-2xl text-sm font-black transition touch-manipulation active:scale-[0.98] ${
                              isSelected
                                ? "bg-[#0057d9] text-white shadow-[0_12px_26px_rgba(0,87,217,0.22)]"
                                : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#0057d9]"
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                <section className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5">
                  <motion.div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-black text-slate-950 sm:text-xl">
                      <Calendar className="h-5 w-5 shrink-0 text-[#0057d9]" />
                      Ne zaman gelmek istersiniz?
                    </h3>
                    {selectedDate && (
                      <p className="text-sm font-bold text-[#0057d9]">
                        {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
                      </p>
                    )}
                  </motion.div>

                  {!hasBusinessAvailability && (
                    <p className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold leading-6 text-slate-600">
                      İşletme özel çalışma saati tanımlamadı; hafta içi 09:00–18:00
                      arası müsait günler gösteriliyor.
                    </p>
                  )}

                  <div className="mb-4 flex rounded-2xl border border-slate-100 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setDatePickerMode("quick")}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-black transition touch-manipulation sm:text-sm ${
                        datePickerMode === "quick"
                          ? "bg-white text-[#0057d9] shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Yakın tarihler
                    </button>
                    <button
                      type="button"
                      onClick={() => setDatePickerMode("calendar")}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-black transition touch-manipulation sm:text-sm ${
                        datePickerMode === "calendar"
                          ? "bg-white text-[#0057d9] shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Takvim
                    </button>
                  </div>

                  {datePickerMode === "quick" ? (
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {quickPickDates.map((date) => {
                        const selectable = isDateSelectable(date);
                        const isSelected =
                          selectedDate && isSameDay(date, selectedDate);

                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            disabled={!selectable}
                            onClick={() => handleDatePick(date)}
                            className={`flex min-w-[72px] shrink-0 flex-col items-center rounded-2xl border px-3 py-3 text-center transition touch-manipulation active:scale-[0.98] ${
                              isSelected
                                ? "border-[#0057d9] bg-[#0057d9] text-white shadow-[0_12px_26px_rgba(0,87,217,0.22)]"
                                : !selectable
                                  ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                                  : isToday(date)
                                    ? "border-[#0057d9]/30 bg-white text-[#0057d9]"
                                    : "border-slate-100 bg-white text-slate-700"
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wide opacity-80">
                              {format(date, "EEE", { locale: tr })}
                            </span>
                            <span className="mt-1 text-lg font-black leading-none">
                              {format(date, "d")}
                            </span>
                            <span className="mt-1 text-[10px] font-bold opacity-80">
                              {format(date, "MMM", { locale: tr })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-3 sm:p-4">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm touch-manipulation"
                        aria-label="Önceki ay"
                      >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                      </button>

                      <span className="text-center text-sm font-black capitalize text-slate-950 sm:text-base">
                        {format(currentMonth, "MMMM yyyy", { locale: tr })}
                      </span>

                      <button
                        type="button"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm touch-manipulation"
                        aria-label="Sonraki ay"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
                      {WEEKDAY_SHORT.map((day) => (
                        <div
                          key={day}
                          className="py-1 text-[10px] font-black text-slate-400 sm:text-xs"
                        >
                          {day}
                        </div>
                      ))}

                      {Array.from({
                        length: getMonthGridLeadingEmptyCount(currentMonth),
                      }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}

                      {eachDayOfInterval({
                        start: startOfMonth(currentMonth),
                        end: endOfMonth(currentMonth),
                      }).map((date) => {
                        const isSelected =
                          selectedDate && isSameDay(date, selectedDate);
                        const selectable = isDateSelectable(date);

                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            disabled={!selectable}
                            onClick={() => handleDatePick(date)}
                            className={`flex min-h-[44px] items-center justify-center rounded-2xl text-sm font-black transition touch-manipulation active:scale-[0.98] sm:min-h-[48px] ${
                              isSelected
                                ? "bg-[#0057d9] text-white shadow-[0_12px_26px_rgba(0,87,217,0.20)]"
                                : !selectable
                                  ? "cursor-not-allowed text-slate-300"
                                  : isToday(date)
                                    ? "bg-white text-[#0057d9] ring-2 ring-[#0057d9]/20"
                                    : "text-slate-700 hover:bg-white"
                            }`}
                          >
                            {format(date, "d")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  )}
                </section>
              </motion.div>
            )}

            {reservationStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <SummaryCard
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedGuests={selectedGuests}
                  terms={terms}
                />

                <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-950">
                    <Clock className="h-5 w-5 text-[#0057d9]" />
                    Müsait Saat Seçimi
                  </h3>

                  {availableTimes.length === 0 ? (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm font-semibold leading-7 text-amber-700">
                      Seçilen gün için uygun saat bulunamadı. Farklı bir tarih
                      seçmeyi deneyebilirsiniz.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`min-h-[48px] rounded-2xl border text-sm font-black transition touch-manipulation active:scale-[0.98] ${
                            selectedTime === time
                              ? "border-[#0057d9] bg-[#0057d9] text-white shadow-[0_12px_26px_rgba(0,87,217,0.20)]"
                              : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-100 hover:bg-blue-50 hover:text-[#0057d9]"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {reservationStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <SummaryCard
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  selectedGuests={selectedGuests}
                  terms={terms}
                />

                <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-950">
                    <MessageSquare className="h-5 w-5 text-[#0057d9]" />
                    İletişim Bilgileri
                  </h3>

                  <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-7 text-slate-600">
                    {terms.successTitle} onayı için iletişim bilgilerinizi
                    eksiksiz girin.
                  </div>

                  <form
                    id="reservation-form"
                    onSubmit={onSubmitReservation}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Ad Soyad"
                        required
                        value={formValues.customerName}
                        onChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            customerName: value,
                          }))
                        }
                        placeholder="Adınız Soyadınız"
                      />

                      <Input
                        label="Telefon"
                        required
                        type="tel"
                        value={formValues.customerPhone}
                        onChange={(value) =>
                          setFormValues((prev) => ({
                            ...prev,
                            customerPhone: value,
                          }))
                        }
                        placeholder="0555 555 55 55"
                      />
                    </div>

                    <Input
                      label="E-posta"
                      type="email"
                      value={formValues.customerEmail}
                      onChange={(value) =>
                        setFormValues((prev) => ({
                          ...prev,
                          customerEmail: value,
                        }))
                      }
                      placeholder="ornek@email.com"
                    />

                    {questions.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-black text-slate-800">
                          Ek Sorular
                        </h4>

                        {questions.map((q) => (
                          <div key={q.id}>
                            <label className="mb-2 block text-sm font-black text-slate-700">
                              {q.label} {q.isRequired ? "*" : ""}
                            </label>
                            {renderQuestionField(q)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">
                        Özel istekler
                      </label>

                      <textarea
                        rows={3}
                        value={formValues.notes}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-[#0057d9] focus:bg-white"
                        placeholder="Alerji, masa tercihi, özel not vb."
                      />
                    </div>
                  </form>
                </section>
              </motion.div>
            )}

            {reservationStep === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[70vh] flex-col items-center justify-center text-center"
              >
                <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-[36px] bg-emerald-50 text-emerald-600">
                  <CalendarCheck className="h-14 w-14" />
                </div>

                <h2 className="text-3xl font-black text-slate-950">
                  Talebiniz alındı
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500">
                  {terms.successTitle} işletmeye iletildi. Onay durumu için
                  sizinle iletişime geçilecektir.
                </p>

                <div className="mt-8 w-full max-w-sm rounded-[24px] border border-slate-100 bg-white p-5 text-left shadow-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-4 text-sm">
                    <span className="text-slate-500">Talep numarası</span>
                    <span className="font-mono font-black text-slate-950">
                      #{referenceCode || "RES-..."}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tarih</span>
                      <span className="font-black text-slate-950">
                        {selectedDate
                          ? format(selectedDate, "d MMMM yyyy", { locale: tr })
                          : ""}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Saat</span>
                      <span className="font-black text-slate-950">
                        {selectedTime}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 rounded-2xl bg-[#0057d9] px-8 py-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.24)]"
                >
                  Tamamla
                </button>
              </motion.div>
            )}
          </div>

          {reservationStep < 4 && (
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (reservationStep === 1) {
                      onClose();
                    } else {
                      setReservationStep(reservationStep - 1);
                    }
                  }}
                  className="h-14 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  {reservationStep === 1 ? "İptal" : "Geri"}
                </button>

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
                  disabled={!canContinue || isSubmitting}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0057d9] px-8 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.24)] transition hover:bg-[#004cc2] disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                >
                  {reservationStep === 3
                    ? isSubmitting
                      ? "Gönderiliyor..."
                      : `${terms.action}ı Tamamla`
                    : "Devam Et"}
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoCard({ listing, terms }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
      <div className="relative h-36">
        <img
          src={listing?.coverImage}
          alt={listing?.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-100">
            {terms.typeTag}
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">
            {listing?.title}
          </h3>
        </div>
      </div>

      {listing?.location && (
        <div className="flex items-start gap-3 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
            <MapPin className="h-5 w-5 text-[#0057d9]" />
          </div>

          <p className="pt-1 text-sm font-semibold leading-6 text-slate-600">
            {listing.location}
          </p>
        </div>
      )}
    </section>
  );
}

function SummaryCard({ selectedDate, selectedTime, selectedGuests, terms }) {
  return (
    <section className="grid gap-3 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-3">
      <div className="rounded-2xl bg-slate-50 p-4">
        <Calendar className="mb-3 h-5 w-5 text-[#0057d9]" />
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
          Tarih
        </p>
        <p className="mt-1 font-black text-slate-950">
          {selectedDate
            ? format(selectedDate, "d MMM yyyy", { locale: tr })
            : "Seçilmedi"}
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <Clock className="mb-3 h-5 w-5 text-[#0057d9]" />
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
          Saat
        </p>
        <p className="mt-1 font-black text-slate-950">
          {selectedTime || "Seçilmedi"}
        </p>
      </div>

      {terms.showGuests && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <Users className="mb-3 h-5 w-5 text-[#0057d9]" />
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            {terms.unit || "Kişi"}
          </p>
          <p className="mt-1 font-black text-slate-950">
            {selectedGuests === 9 ? "8+" : selectedGuests}
          </p>
        </div>
      )}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0057d9] focus:bg-white"
      />
    </div>
  );
}