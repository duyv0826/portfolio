import Link from "next/link";
import { getRepo } from "@/lib/repo-factory";
import { ProjectCard } from "@/components/site/project-card";
import { SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { SITE } from "@/lib/site-config";

/**
 * 首页（DESIGN.md §10.1）
 *
 * 反模板 Hero：不做「大标题 + 副标题 + 居中 CTA + 抽象 3D」。
 * 左对齐身份陈述 + 右侧真实精选作品预览网格，第一眼呈现的是作品本身。
 */
export default async function HomePage() {
  const repo = await getRepo();
  const featured = await repo.listFeaturedProjects(4);

  return (
    <>
      {/* Hero —— 非对称：左身份陈述 / 右作品预览 */}
      <section className="section-y">
        <div className="container-page grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <h1
              className="text-3xl text-fg md:text-4xl"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-announce)",
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              {SITE.name}
            </h1>
            <p className="font-mono text-sm tracking-tight text-muted">{SITE.tagline}</p>
            <p className="max-w-[46ch] text-lg text-fg-2">{SITE.statement}</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="#works" className="btn btn-primary btn-lg">
                查看作品
                <Icon.ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-lg">
                联系我
              </Link>
            </div>

            {/* 导航式入口 */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2 pt-4" aria-label="分区入口">
              <Link href="/works" className="text-sm text-muted hover:text-fg">
                作品
              </Link>
              <Link href="/blog" className="text-sm text-muted hover:text-fg">
                博客
              </Link>
              <Link href="/about" className="text-sm text-muted hover:text-fg">
                关于
              </Link>
            </nav>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            {featured.slice(0, 1).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                priority
                className="sm:col-span-2"
              />
            ))}
            {featured.slice(1).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* 精选作品区（锚点） */}
      <section id="works" className="section-y border-t border-border-soft pt-16">
        <div className="container-page flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Selected Works"
              title="精选作品"
              description="每件都标注了个人角色、素材来源与授权状态。"
            />
            <Link
              href="/works"
              className="flex items-center gap-1 text-sm text-accent hover:underline"
              style={{ textUnderlineOffset: "3px" }}
            >
              查看全部作品
              <Icon.ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={`grid-${project.id}`} project={project} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
