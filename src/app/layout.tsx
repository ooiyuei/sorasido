import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ソラしどファーム - 予約・注文管理",
  description: "ぶどう農場の予約・注文・在庫・配達管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="light">
      <body className={`${geistSans.variable} font-sans antialiased bg-[#f5f5f7] text-[#1a1a2e]`}>
        <AuthGuard>
          <Navigation />
          <main className="md:ml-56 min-h-screen pb-20 md:pb-0">
            <div className="max-w-5xl mx-auto px-4 py-5 md:px-6 md:py-8">
              {children}
            </div>
          </main>
        </AuthGuard>
      </body>
    </html>
  );
}
