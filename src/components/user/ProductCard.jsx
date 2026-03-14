"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export function ProductCard({ product, businessId, onAddToCart }) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState({});
  const [quantity, setQuantity] = useState(1);

  const handleVariantChange = (variantId, option) => {
    setSelectedVariant({ ...selectedVariant, [variantId]: option });
  };

  const getFinalPrice = () => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      const selectedOption = selectedVariant[variant.id];
      if (selectedOption) {
        const optionIndex = variant.options.indexOf(selectedOption);
        if (optionIndex >= 0 && variant.prices) {
          return variant.prices[optionIndex] * quantity;
        }
      }
    }
    return product.price * quantity;
  };

  const handleAddToCartClick = () => {
    const cartItem = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      variant: selectedVariant,
      businessId,
      image: product.image,
      total: getFinalPrice(),
    };
    onAddToCart(cartItem);
    router.push("/user/cart");
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{product.description}</p>

      {/* Varyant Seçimi */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-4 space-y-2">
          {product.variants.map((variant) => (
            <div key={variant.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {variant.name}
              </label>
              <select
                value={selectedVariant[variant.id] || ""}
                onChange={(e) =>
                  handleVariantChange(variant.id, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004aad] focus:border-transparent"
              >
                <option value="">Seçiniz</option>
                {variant.options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                    {variant.prices && variant.prices[idx]
                      ? ` - ${variant.prices[idx]} ₺`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Adet Seçimi */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            -
          </button>
          <span className="w-12 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            +
          </button>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#004aad]">
            {getFinalPrice().toFixed(2)} ₺
          </p>
          {quantity > 1 && (
            <p className="text-xs text-gray-500">
              {product.price.toFixed(2)} ₺ x {quantity}
            </p>
          )}
        </div>
      </div>

      {/* Sepete Ekle Butonu */}
      <button
        onClick={handleAddToCartClick}
        className="w-full bg-[#004aad] text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCartIcon className="h-5 w-5" />
        Sepete Ekle
      </button>

      {/* Stok Durumu */}
      {product.stock !== undefined && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          {product.stock > 0 ? `Stokta ${product.stock} adet` : "Stokta yok"}
        </p>
      )}
    </div>
  );
}
