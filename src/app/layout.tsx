import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sorasido.vercel.app"),
  title: "ソラしどファーム - 予約・注文管理",
  description: "ぶどう農場の予約・注文・在庫・配達管理システム",
  keywords: [
    "ぶどう農場",
    "農場管理",
    "予約管理",
    "注文管理",
    "在庫管理",
    "配達管理",
    "ソラしどファーム",
    "農業管理システム",
    "受付管理",
    "果物農園",
  ],
  alternates: {
    canonical: "https://sorasido.vercel.app",
  },
  openGraph: {
    title: "ソラしどファーム - 予約・注文管理",
    description: "ぶどう農場の予約・注文・在庫・配達管理システム",
    type: "website",
    url: "https://sorasido.vercel.app",
    images: [
      {
        url: "https://sorasido.vercel.app/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ソラしどファーム | 農場受付管理システム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ソラしどファーム - 予約・注文管理",
    description: "ぶどう農場の予約・注文・在庫・配達管理システム",
    images: ["https://sorasido.vercel.app/opengraph-image"],
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ソラしどファーム",
              description: "ぶどう農場の予約・注文・在庫・配達管理システム",
              url: "https://sorasido.vercel.app",
            }),
          }}
        />
        <Script
          id="json-ld-app"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "ソラしどファーム 予約・注文管理システム",
              description: "ぶどう農場向けの予約・注文・在庫・配達管理Webアプリケーション",
              url: "https://sorasido.vercel.app",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
            }),
          }}
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5036886193853440"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
