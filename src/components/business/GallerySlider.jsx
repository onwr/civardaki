"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function GallerySlider({ images = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
            <div className="relative aspect-[16/9] md:aspect-[21/9] bg-slate-100">
                <Image
                    src={images[currentIndex]}
                    alt={`Galeri Görseli ${currentIndex + 1}`}
                    fill
                    className="object-cover transition-all duration-500"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Controls */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50/50 border-t border-slate-100">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${currentIndex === idx ? 'ring-2 ring-blue-600 ring-offset-2 scale-95' : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            <Image src={img} alt="Thumbnail" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
