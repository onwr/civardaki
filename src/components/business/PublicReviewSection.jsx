"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquareQuote, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function PublicReviewSection({ businessId, businessSlug, rating, reviewCount }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        reviewerName: "",
        rating: 5,
        content: "",
        _honeypot: ""
    });

    useEffect(() => {
        const fetchApprovedReviews = async () => {
            try {
                // Fetch only approved reviews for this business
                const res = await fetch(`/api/public/businesses/${businessSlug}/reviews`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.reviews || []);
                }
            } catch (err) {
                console.error("Failed to load reviews");
            } finally {
                setIsLoading(false);
            }
        };

        if (businessSlug) {
            fetchApprovedReviews();
        }
    }, [businessSlug]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.reviewerName || form.rating < 1 || form.rating > 5) {
            toast.error("Lütfen adınızı girin ve bir puan seçin.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/public/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessSlug,
                    reviewerName: form.reviewerName,
                    rating: form.rating,
                    content: form.content,
                    _honeypot: form._honeypot
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gönderilemedi.");
            }

            toast.success(data.message || "Değerlendirmeniz alındı ve onaya gönderildi.");
            setIsFormOpen(false);
            setForm({ reviewerName: "", rating: 5, content: "", _honeypot: "" });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex flex-col items-center justify-center text-yellow-500 border border-yellow-100">
                        <span className="text-xl font-black italic leading-none">{rating > 0 ? rating.toFixed(1) : "—"}</span>
                        <Star className="w-4 h-4 fill-current mt-1" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter italic leading-none">Değerlendirmeler</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1">{reviewCount > 0 ? `${reviewCount} Onaylı Yorum` : "Henüz değerlendirme yok"}</p>
                    </div>
                </div>

                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-blue-600 shadow-md"
                    >
                        Değerlendirme Yaz
                    </button>
                )}
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-black text-slate-900 uppercase italic">Puanınız & Yorumunuz</h3>
                        <button type="button" onClick={() => setIsFormOpen(false)} className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-900">Vazgeç</button>
                    </div>

                    {/* Honeypot */}
                    <input
                        type="text"
                        name="_honeypot"
                        value={form._honeypot}
                        onChange={(e) => setForm(p => ({ ...p, _honeypot: e.target.value }))}
                        className="hidden absolute -left-[9999px]"
                        tabIndex="-1"
                    />

                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setForm(p => ({ ...p, rating: star }))}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${form.rating >= star ? 'bg-yellow-400 text-white shadow-lg scale-110' : 'bg-white text-slate-300 border border-slate-200 hover:scale-105'}`}
                            >
                                <Star className={form.rating >= star ? 'fill-current w-6 h-6' : 'w-5 h-5'} />
                            </button>
                        ))}
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Adınız Soyadınız"
                            value={form.reviewerName}
                            onChange={(e) => setForm(p => ({ ...p, reviewerName: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-semibold"
                            required
                        />
                    </div>

                    <div>
                        <textarea
                            placeholder="Deneyiminizi anlatın... (İsteğe bağlı)"
                            rows={3}
                            value={form.content}
                            onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-semibold resize-none"
                        />
                    </div>

                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5 opacity-80">
                        <AlertTriangle className="w-3 h-3" /> Yorumunuz işletme onayından sonra yayınlanacaktır.
                    </p>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? "Gönderiliyor..." : "GÖNDER"}
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {isLoading ? (
                    <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
                ) : reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-5">
                            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <MessageSquareQuote className="w-5 h-5 text-slate-300" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h4 className="font-black text-slate-900 italic">{review.reviewerName}</h4>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <span className="text-[11px] font-black text-yellow-600">{review.rating}</span>
                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" /> ONAYLI MÜŞTERİ • {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                                {review.content && (
                                    <p className="text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
                                        "{review.content}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : null}
            </div>
        </div>
    );
}
