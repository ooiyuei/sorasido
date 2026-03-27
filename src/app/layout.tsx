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
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? "ca-pub-5036886193853440";

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
        {ADSENSE_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
