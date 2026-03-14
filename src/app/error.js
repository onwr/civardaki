"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global UI Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
                    <ExclamationTriangleIcon className="h-12 w-12 text-amber-600" aria-hidden="true" />
                </div>

                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Bir şeyler ters gitti!
                    </h2>
                    <p className="mt-4 text-base text-gray-500">
                        Beklenmeyen bir sunucu hatasıyla karşılaştık. Müşteri hizmetlerimize haber verdik, kısa sürede çözeceğiz.
                    </p>
                </div>

                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center mt-8">
                    <button
                        onClick={() => reset()}
                        className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                    <Link
                        href="/"
                        className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Anasayfaya Dön
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Civardaki. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    );
}
