import { SITE } from "@/lib/site-config";
import { getRepo } from "@/lib/repo-factory";
import type { MetadataRoute } from "next";

/**
 * 站点地图（ADR-002：百度 SEO 硬需求）。
 * 只收录公开且已发布的内容 —— 草稿与后台路径不进 sitemap。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const repo = await getRepo();

  const projects = await repo.listProjects({ page: 1, limit: 100 });
  const posts = await repo.listPosts({ page: 1, limit: 100 });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/works`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.items.map((project) => ({
    url: `${baseUrl}/works/${project.slug}`,
    lastModified: new Date(project.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.items.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}

export const dynamic = "force-dynamic";
export const metadata = { title: SITE.name };
