"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/mock-data/user-businesses";

export function CategoryGrid() {
  const router = useRouter();

  const handleCategoryClick = (categoryId) => {
    router.push(`/user/isletmeler?category=${categoryId}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCategoryClick(category.id)}
          className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#004aad]"
        >
          <div className="text-5xl sm:text-6xl mb-4">{category.icon}</div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {category.subcategories.join(", ")}
          </p>
        </motion.button>
      ))}
    </div>
  );
}

