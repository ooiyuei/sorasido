import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sorasido.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: ["/blog", "/privacy", "/"],
      disallow: ["/receptions", "/accounting", "/customers", "/sales", "/sets", "/varieties", "/calendar", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
