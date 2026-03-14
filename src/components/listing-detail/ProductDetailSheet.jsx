"use client";

import {
  ArrowLeft,
  Clock,
  Utensils,
  CheckCircle,
  Minus,
  Plus,
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
  const basePrice = Number(product.basePrice ?? product.price) || 0;
  const variantExtra =
    hasVariants && selectedVariant ? Number(selectedVariant.price) || 0 : 0;
  const unitPrice = basePrice + variantExtra;
  const unitTotal = unitPrice + (calculateExtrasPrice?.() || 0);
  const displayTotal = unitTotal * productQuantity;

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[99999] bg-white flex flex-col lg:flex-row overflow-hidden h-[100dvh] w-full"
    >
      {/* Desktop: left image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900 h-full">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center gap-2 transition-colors z-20"
        >
          <ArrowLeft className="w-6 h-6" /> Kapat
        </button>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          {product.allergens?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.allergens.map((a) => (
                <span
                  key={a}
                  className="bg-red-500/90 text-sm px-3 py-1.5 rounded-lg font-semibold"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
          {product.prepTime && (
            <span className="inline-flex items-center gap-2 bg-slate-700/80 text-sm px-3 py-1.5 rounded-lg font-semibold mr-2">
              <Clock className="w-4 h-4" /> {product.prepTime}
            </span>
          )}
          {product.calories && (
            <span className="inline-flex items-center gap-2 bg-slate-700/80 text-sm px-3 py-1.5 rounded-lg font-semibold">
              <Utensils className="w-4 h-4" /> {product.calories} kcal
            </span>
          )}
          <h2 className="text-4xl font-bold mt-4 leading-tight">
            {product.name}
          </h2>
          <p className="text-slate-300 text-lg mt-2 line-clamp-3">
            {product.description}
          </p>
        </div>
      </div>

      {/* Right / Mobile content */}
      <div className="flex-1 flex flex-col bg-white h-full relative">
        {/* Mobile header */}
        <div className="lg:hidden relative h-56 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold drop-shadow-md">
              {product.name}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 pb-36">
          <div className="hidden lg:block mb-6 pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {product.name}
            </h2>
            <span className="text-2xl font-bold text-slate-900">
              {unitPrice}₺
            </span>
          </div>

          <div className="lg:hidden mb-6">
            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            {hasVariants && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">
                  Boyut / Varyant
                </h4>
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                      selectedVariant == null
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedVariant == null
                            ? "border-slate-900"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedVariant == null && (
                          <div className="w-2 h-2 rounded-full bg-slate-900" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="variant"
                        className="hidden"
                        onChange={() => setSelectedVariant?.(null)}
                        checked={selectedVariant == null}
                      />
                      <span
                        className={`text-sm font-medium ${
                          selectedVariant == null
                            ? "text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        Stabil
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {basePrice}₺
                    </span>
                  </label>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <label
                        key={v.id}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-slate-900"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-slate-900" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="variant"
                            className="hidden"
                            onChange={() =>
                              setSelectedVariant?.({
                                id: v.id,
                                name: v.name,
                                price: v.price,
                                discountPrice: v.discountPrice,
                              })
                            }
                            checked={isSelected}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? "text-slate-900" : "text-slate-600"
                            }`}
                          >
                            {v.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {basePrice + (Number(v.price) || 0)}₺
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {product.options?.map((opt, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-slate-900">{opt.title}</h4>
                  <span className="text-[10px] font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full">
                    Zorunlu
                  </span>
                </div>
                <div className="space-y-2">
                  {opt.choices?.map((choice, i) => {
                    const isSelected =
                      productOptions[opt.title]?.[0]?.name === choice.name;
                    return (
                      <label
                        key={i}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-slate-900"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-slate-900" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name={opt.title}
                            className="hidden"
                            onChange={() =>
                              handleOptionChange(opt.title, choice, "radio")
                            }
                            checked={isSelected}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isSelected ? "text-slate-900" : "text-slate-600"
                            }`}
                          >
                            {choice.name}
                          </span>
                        </div>
                        {choice.price > 0 && (
                          <span className="text-xs font-semibold text-slate-500">
                            +{choice.price}₺
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {product.extras?.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Ekstralar</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.extras.map((extra, i) => {
                    const isChecked = productOptions["Ekstralar"]?.some(
                      (e) => e.name === extra.name,
                    );
                    return (
                      <label
                        key={i}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                          isChecked
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-100 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isChecked
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {isChecked && <CheckCircle className="w-3 h-3" />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            onChange={(e) =>
                              handleOptionChange(
                                "Ekstralar",
                                extra,
                                "check",
                                e.target.checked,
                              )
                            }
                            checked={isChecked || false}
                          />
                          <span
                            className={`text-sm font-medium ${
                              isChecked ? "text-slate-900" : "text-slate-700"
                            }`}
                          >
                            {extra.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          +{extra.price}₺
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Sipariş notu</h4>
              <textarea
                placeholder="Özel isteklerinizi yazabilirsiniz..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all min-h-[100px] resize-none text-sm"
                value={productNote}
                onChange={(e) => setProductNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 bg-white absolute bottom-0 left-0 right-0 z-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() =>
                setProductQuantity(Math.max(1, productQuantity - 1))
              }
              className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:text-slate-900 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-14 text-center font-bold text-lg text-slate-900">
              {productQuantity}
            </span>
            <button
              type="button"
              onClick={() => setProductQuantity(productQuantity + 1)}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-lg border border-slate-200 hover:text-slate-900 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={addToCart}
            className="w-full sm:flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-between px-6"
          >
            <span>Sepete ekle</span>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
              {displayTotal}₺
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
