import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/dashboard", "/receptions", "/accounting", "/customers", "/sales", "/sets", "/varieties", "/calendar"],
    },
  };
}
