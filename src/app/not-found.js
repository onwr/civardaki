import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const metadata = {
    title: "Sayfa Bulunamadı | Civardaki",
    robots: { index: false, follow: false }
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
                    <MagnifyingGlassIcon className="h-12 w-12 text-blue-600" aria-hidden="true" />
                </div>

                <div>
                    <h2 className="text-9xl font-extrabold text-gray-200 tracking-tighter mb-2">
                        404
                    </h2>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Aradığınız sayfayı bulamadık
                    </h3>
                    <p className="mt-4 text-base text-gray-500">
                        Bağlantı hatalı olabilir veya işletme yayından kaldırılmış olabilir.
                    </p>
                </div>

                <div className="pt-6">
                    <Link
                        href="/"
                        className="inline-flex w-full justify-center items-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-[1.02]"
                    >
                        Keşfetmeye Devam Et
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
