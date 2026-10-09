import type { MetadataRoute } from "next";

/**
 * robots.txt（ADR-002：百度 SEO）。
 * 后台与 API 一律屏蔽抓取 —— /admin 与 /api 不参与收录。
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/works", "/blog", "/about", "/contact"],
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
