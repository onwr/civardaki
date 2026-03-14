"use client";

import Image from "next/image";
import { useState } from "react";
import { MessageSquare } from "lucide-react";

export default function CatalogSection({ catalogData, businessSlug, onLeadWithProduct }) {
    if (!catalogData) return null;

    const { categories, uncategorized } = catalogData;
    const hasAnyProduct = (categories?.length > 0 && categories.some(c => c.products?.length > 0)) || uncategorized?.length > 0;

    if (!hasAnyProduct) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
                <h2 className="text-lg font-black text-slate-950">Menü / Ürünler</h2>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                    Bu işletme henüz menü veya ürün kataloğu eklememiş.
                </p>
            </div>
        );
    }

    const handleRequestQuote = (product) => {
        // SPRINT 9B: Telemetry Tracking
        const trackEvent = () => {
            fetch("/api/public/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessSlug,
                    type: "VIEW_PRODUCT",
                    productId: product.id
                })
            }).catch(() => { });
        };
        trackEvent();

        if (onLeadWithProduct) {
            onLeadWithProduct({
                productId: product.id,
                productName: product.name,
                prefillMessage: `Merhaba, ${product.name} hakkında bilgi almak istiyorum.`
            });
        }
    };

    const ProductCard = ({ product }) => (
        <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all group">
            {product.imageUrl && (
                <div className="w-full h-32 overflow-hidden bg-white border-b border-slate-100">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={400}
                        height={128}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
                <h4 className="text-sm font-black text-slate-900">{product.name}</h4>
                {product.description && (
                    <p className="mt-1 text-xs font-semibold text-slate-500 line-clamp-2 flex-1">
                        {product.description}
                    </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {product.price === null ? (
                            <span className="text-xs font-extrabold text-blue-600 bg-blue-500/10 px-2 py-1 rounded-lg">Teklif Al</span>
                        ) : (
                            <>
                                {product.discountPrice !== null ? (
                                    <>
                                        <span className="text-sm font-black text-slate-900">{product.discountPrice} ₺</span>
                                        <span className="text-xs font-bold text-slate-400 line-through">{product.price} ₺</span>
                                    </>
                                ) : (
                                    <span className="text-sm font-black text-slate-900">{product.price} ₺</span>
                                )}
                            </>
                        )}
                    </div>
                    {onLeadWithProduct && (
                        <button
                            onClick={() => handleRequestQuote(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004aad] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
                        >
                            <MessageSquare className="w-3 h-3" />
                            Talep Bırak
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black text-slate-950">Menü / Ürünler</h2>

            {categories?.map((cat) => {
                if (!cat.products || cat.products.length === 0) return null;
                return (
                    <div key={cat.id} className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">{cat.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cat.products.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {uncategorized?.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Diğer</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {uncategorized.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
