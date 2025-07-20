import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminPanel from "@/components/AdminPanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sağlığım - Sağlık Profesyonelleri Sosyal Ağı",
  description: "Sağlık uzmanları ve hastalar için güvenilir bilgi paylaşım platformu. Uzmanlarla bağlantı kurun, sorularınızı sorun ve sağlıklı yaşamı destekleyin.",
  keywords: "sağlık, doktor, diyetisyen, fizyoterapist, psikolog, tıbbi bilgi, sağlık danışmanı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <AdminPanel />
        </div>
      </body>
    </html>
  );
}
