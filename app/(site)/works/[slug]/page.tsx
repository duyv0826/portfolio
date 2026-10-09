import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepo } from "@/lib/repo-factory";
import { MarkdownView } from "@/components/site/markdown-view";
import { ProjectCard } from "@/components/site/project-card";
import { COPYRIGHT_HOLDER } from "@/lib/site-config";

interface WorkDetailProps {
  params: Promise<{ slug: string }>;
}

/** 详情页 SEO：标题、描述、OG 图全部来自真实数据 */
export async function generateMetadata({ params }: WorkDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepo();
  const project = await repo.getProjectBySlug(slug);
  if (!project) return { title: "作品未找到" };
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [{ url: project.cover_image_url }],
    },
  };
}

/**
 * 作品详情（DESIGN.md §10.3）
 *
 * 暗舞台（--color-stage）—— 有功能目的的局部暗色：用近黑背景框住主图让作品跳出来，
 * 不是全站暗主题。作者 ID「©洪兄」固定标注于展台右下角。
 */
export default async function WorkDetailPage({ params }: WorkDetailProps) {
  const { slug } = await params;
  const repo = await getRepo();
  const project = await repo.getProjectBySlug(slug);
  if (!project) notFound();

  const related = await repo.listRelatedProjects(slug, 3);

  return (
    <article>
      {/* Gallery Stage —— 暗展台 */}
      <section className="bg-stage text-stage-fg">
        <div className="container-page py-8 md:py-12">
          <div className="relative mx-auto flex max-h-[70vh] w-full items-center justify-center">
            <Image
              src={project.cover_image_url}
              alt={`${project.title} — ${COPYRIGHT_HOLDER}`}
              width={1200}
              height={900}
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="h-auto max-h-[64vh] w-auto object-contain"
            />
          </div>
          <p className="mt-4 text-right font-mono text-xs text-stage-fg opacity-70">
            {COPYRIGHT_HOLDER}
          </p>
        </div>
      </section>

      {/* 结构化信息区 */}
      <section className="section-y">
        <div className="container-page flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h1
              className="text-2xl text-fg md:text-3xl"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-announce)",
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              {project.title}
            </h1>
            <p className="max-w-[60ch] text-lg text-fg-2">{project.summary}</p>

            {/* 元信息行 */}
            <dl className="flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-4">
              {project.role && (
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-xs tracking-caps text-meta uppercase">角色</dt>
                  <dd className="text-sm text-fg-2">{project.role}</dd>
                </div>
              )}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-xs tracking-caps text-meta uppercase">工具 / 方向</dt>
                  <dd className="text-sm text-fg-2">{project.tags.join(" · ")}</dd>
                </div>
              )}
              {project.year && (
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-xs tracking-caps text-meta uppercase">年份</dt>
                  <dd className="font-mono text-sm text-fg-2">{project.year}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* 案例叙事：结果 → 目标 → 解决 */}
          <div className="max-w-[72ch]">
            <MarkdownView content={project.content_md} />
          </div>

          {/* 版权 / 素材来源 */}
          {(project.material_source || project.license_type || project.attribution) && (
            <aside className="card p-6">
              <h2
                className="text-lg text-fg"
                style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-emphasize)" }}
              >
                素材与授权
              </h2>
              <dl className="mt-4 flex flex-col gap-3">
                {project.material_source && (
                  <div className="flex flex-col gap-1">
                    <dt className="font-mono text-xs tracking-caps text-meta uppercase">素材来源</dt>
                    <dd className="text-sm text-fg-2">{project.material_source}</dd>
                  </div>
                )}
                {project.license_type && (
                  <div className="flex flex-col gap-1">
                    <dt className="font-mono text-xs tracking-caps text-meta uppercase">授权类型</dt>
                    <dd className="font-mono text-sm text-fg-2">{project.license_type}</dd>
                  </div>
                )}
                {project.attribution && (
                  <div className="flex flex-col gap-1">
                    <dt className="font-mono text-xs tracking-caps text-meta uppercase">第三方署名</dt>
                    <dd className="text-sm text-fg-2">{project.attribution}</dd>
                  </div>
                )}
                {project.client_auth_status && (
                  <div className="flex flex-col gap-1">
                    <dt className="font-mono text-xs tracking-caps text-meta uppercase">委托授权</dt>
                    <dd className="font-mono text-sm text-fg-2">{project.client_auth_status}</dd>
                  </div>
                )}
              </dl>
            </aside>
          )}

          {/* 过程迭代图 */}
          {project.gallery_urls && project.gallery_urls.length > 1 && (
            <div className="flex flex-col gap-4">
              <h2
                className="text-lg text-fg"
                style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-emphasize)" }}
              >
                过程迭代
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {project.gallery_urls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-surface-warm"
                  >
                    <Image
                      src={url}
                      alt={`${project.title} 过程图 ${index + 1} — ${COPYRIGHT_HOLDER}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 相关作品 */}
          {related.length > 0 && (
            <div className="flex flex-col gap-6 border-t border-border-soft pt-10">
              <h2
                className="text-lg text-fg"
                style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-emphasize)" }}
              >
                相关作品
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ProjectCard key={item.id} project={item} />
                ))}
              </div>
            </div>
          )}

          <Link href="/works" className="self-start text-sm text-muted hover:text-fg">
            ← 返回作品列表
          </Link>
        </div>
      </section>
    </article>
  );
}
