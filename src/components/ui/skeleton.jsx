"use client";

import { motion } from "framer-motion";

// Skeleton animasyonu
const shimmerVariants = {
  animate: {
    x: ["-100%", "100%"],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 1.5,
        ease: "linear",
      },
    },
  },
};

// Base Skeleton Component
function SkeletonBase({ className = "", children }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
    >
      <motion.div
        variants={shimmerVariants}
        animate="animate"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
      />
      {children}
    </div>
  );
}

// Card Skeleton
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <SkeletonBase className="h-12 w-12 rounded-lg mb-4" />
      <SkeletonBase className="h-4 w-24 mb-2" />
      <SkeletonBase className="h-8 w-32" />
    </div>
  );
}

// List Item Skeleton
export function SkeletonListItem({ className = "" }) {
  return (
    <div className={`flex items-center space-x-4 p-4 ${className}`}>
      <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-1/2" />
      </div>
      <SkeletonBase className="h-8 w-20" />
    </div>
  );
}

// Table Row Skeleton
export function SkeletonTableRow({ columns = 4, className = "" }) {
  return (
    <div className={`flex items-center p-4 border-b border-gray-200 ${className}`}>
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="flex-1 px-2">
          <SkeletonBase className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

// Stat Card Skeleton
export function SkeletonStatCard({ className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <SkeletonBase className="h-12 w-12 rounded-xl" />
        <SkeletonBase className="h-4 w-16" />
      </div>
      <SkeletonBase className="h-3 w-24 mb-2" />
      <SkeletonBase className="h-8 w-32" />
    </div>
  );
}

// Text Skeleton
export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          className={`h-4 ${index === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

// Custom Skeleton (genel kullanım)
export default function Skeleton({ className = "", width, height }) {
  return (
    <SkeletonBase
      className={className}
      style={{ width: width || "100%", height: height || "1rem" }}
    />
  );
}
