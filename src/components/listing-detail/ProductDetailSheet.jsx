"use client";

import {
  ArrowLeft,
  Clock3,
  Minus,
  Plus,
  Check,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { motion } from "framer-motion";

export default function ProductDetailSheet({
  product,
  onClose,
  productQuantity,
  setProductQuantity,
  productOptions,
  handleOptionChange,
  productNote,
  setProductNote,
  selectedVariant,
  setSelectedVariant,
  addToCart,
  calculateExtrasPrice,
}) {
  if (!product) return null;

  const hasVariants = product.variants?.length > 0;

  const basePrice =
    Number(product.basePrice ?? product.price) || 0;

  const variantExtra =
    hasVariants && selectedVariant
      ? Number(selectedVariant.price) || 0
      : 0;

  const unitPrice = basePrice + variantExtra;
  const extrasPrice = calculateExtrasPrice?.() || 0;
  const total = (unitPrice + extrasPrice) * productQuantity;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{
          type: "spring",
          damping: 26,
          stiffness: 220,
        }}
        className="absolute inset-x-0 bottom-0 top-0 overflow-hidden bg-[#f8fafc] lg:left-auto lg:w-[720px]"
      >
        {/* HEADER */}
        <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 lg:px-7">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Ürün Detayı
              </p>

              <h2 className="mt-1 text-sm font-black text-slate-900">
                {product.name}
              </h2>
            </div>

            <div className="w-11" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="h-[calc(100%-96px)] overflow-y-auto pb-[160px]">
          {/* IMAGE */}
          <div className="relative h-[300px] overflow-hidden bg-slate-100 lg:h-[360px]">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="mb-3 flex flex-wrap gap-2">
                {product.prepTime && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white backdrop-blur-xl">
                    <Clock3 className="h-4 w-4" />
                    {product.prepTime}
                  </span>
                )}

                {product.allergens?.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-black text-white"
                  >
                    {a}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-black tracking-[-0.03em] text-white">
                {product.name}
              </h1>

              <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-7 text-white/80">
                {product.description}
              </p>
            </div>
          </div>

          <div className="space-y-7 px-5 py-6 lg:px-7">
            {/* PRICE */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Başlangıç fiyatı
                  </p>

                  <h3 className="mt-2 text-4xl font-black tracking-[-0.03em] text-slate-950">
                    {unitPrice}₺
                  </h3>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50">
                  <ShoppingBag className="h-8 w-8 text-[#0057d9]" />
                </div>
              </div>
            </div>

            {/* VARIANTS */}
            {hasVariants && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <Sparkles className="h-6 w-6 text-[#0057d9]" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-950">
                      Boyut Seçimi
                    </h3>

                    <p className="text-sm text-slate-500">
                      Bir varyant seçin
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedVariant?.(null)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 transition ${selectedVariant == null
                        ? "border-[#0057d9] bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedVariant == null
                            ? "border-[#0057d9] bg-[#0057d9]"
                            : "border-slate-300"
                          }`}
                      >
                        {selectedVariant == null && (
                          <Check className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>

                      <div className="text-left">
                        <p className="font-black text-slate-900">
                          Standart
                        </p>

                        <p className="text-xs text-slate-500">
                          Normal seçenek
                        </p>
                      </div>
                    </div>

                    <span className="text-lg font-black text-slate-950">
                      {basePrice}₺
                    </span>
                  </button>

                  {product.variants.map((v) => {
                    const isSelected =
                      selectedVariant?.id === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setSelectedVariant?.({
                            id: v.id,
                            name: v.name,
                            price: v.price,
                          })
                        }
                        className={`flex w-full items-center justify-between rounded-2xl border p-4 transition ${isSelected
                            ? "border-[#0057d9] bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isSelected
                                ? "border-[#0057d9] bg-[#0057d9]"
                                : "border-slate-300"
                              }`}
                          >
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-white" />
                            )}
                          </div>

                          <div className="text-left">
                            <p className="font-black text-slate-900">
                              {v.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              Premium seçenek
                            </p>
                          </div>
                        </div>

                        <span className="text-lg font-black text-slate-950">
                          {basePrice + Number(v.price || 0)}₺
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* EXTRAS */}
            {product.extras?.length > 0 && (
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-xl font-black text-slate-950">
                  Ekstralar
                </h3>

                <div className="space-y-3">
                  {product.extras.map((extra, i) => {
                    const isChecked =
                      productOptions["Ekstralar"]?.some(
                        (e) => e.name === extra.name
                      );

                    return (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${isChecked
                            ? "border-[#0057d9] bg-blue-50"
                            : "border-slate-200 bg-white"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-xl border-2 ${isChecked
                                ? "border-[#0057d9] bg-[#0057d9]"
                                : "border-slate-300"
                              }`}
                          >
                            {isChecked && (
                              <Check className="h-3.5 w-3.5 text-white" />
                            )}
                          </div>

                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked || false}
                            onChange={(e) =>
                              handleOptionChange(
                                "Ekstralar",
                                extra,
                                "check",
                                e.target.checked
                              )
                            }
                          />

                          <span className="font-bold text-slate-800">
                            {extra.name}
                          </span>
                        </div>

                        <span className="text-sm font-black text-[#0057d9]">
                          +{extra.price}₺
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            {/* NOTE */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-black text-slate-950">
                Sipariş Notu
              </h3>

              <textarea
                placeholder="Özel isteklerinizi yazabilirsiniz..."
                className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm outline-none transition focus:border-[#0057d9] focus:bg-white"
                value={productNote}
                onChange={(e) => setProductNote(e.target.value)}
              />
            </section>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() =>
                  setProductQuantity(
                    Math.max(1, productQuantity - 1)
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-700 transition hover:bg-slate-100"
              >
                <Minus className="h-5 w-5" />
              </button>

              <span className="w-16 text-center text-xl font-black text-slate-950">
                {productQuantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setProductQuantity(productQuantity + 1)
                }
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-700 transition hover:bg-slate-100"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={addToCart}
              className="flex h-14 flex-1 items-center justify-between rounded-2xl bg-[#0057d9] px-6 text-white shadow-[0_18px_40px_rgba(0,87,217,0.26)] transition hover:bg-[#004cc2]"
            >
              <span className="text-sm font-black">
                Sepete Ekle
              </span>

              <span className="rounded-xl bg-white/15 px-4 py-2 text-sm font-black">
                {total}₺
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}