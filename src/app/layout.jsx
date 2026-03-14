import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ClientLayout from "@/components/layout/ClientLayout";
import AppProviders from "@/components/providers/AppProviders";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Civardaki.com - Yakındaki İşletmeler",
  description:
    "Yakınınızdaki işletmeleri keşfedin. Restoran, market, hizmet sağlayıcılar ve daha fazlası.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body
        className={`${manrope.variable} ${geistMono.variable} antialiased font-sans bg-slate-50`}
      >
        <AppProviders>
          <Toaster
            position="top-center"
            expand={false}
            richColors
            closeButton
            theme="light"
          />
          <ClientLayout>{children}</ClientLayout>
        </AppProviders>
      </body>
    </html>
  );
}
