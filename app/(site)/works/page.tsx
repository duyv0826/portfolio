import type { Metadata } from "next";
import Link from "next/link";
import { getRepo } from "@/lib/repo-factory";
import { ProjectCard } from "@/components/site/project-card";
import { Pagination } from "@/components/site/pagination";
import { EmptyState, SectionHeading } from "@/components/ui/primitives";
import { PAGE_SIZE, WORK_CATEGORIES } from "@/lib/site-config";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "作品",
  description: "互动媒体艺术与游戏设计方向的作品集，含个人角色、素材来源与授权状态标注。",
};

interface WorksPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

/** 作品列表（DESIGN.md §10.2）：筛选 chips + 错落网格 + 分页 */
export default async function WorksPage({ searchParams }: WorksPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const category = params.category ?? "all";

  const repo = await getRepo();
  const { items, total } = await repo.listProjects({
    page,
    limit: PAGE_SIZE.works,
    category,
  });

  return (
    <div className="section-y">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading
          eyebrow="Works"
          title="作品"
          description="按参与时间与类别排列。团队项目会显式标注个人贡献。"
        />

        {/* 筛选 chips：URL query 同步，可被抓取与分享 */}
        <nav className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1" aria-label="作品分类筛选">
          {WORK_CATEGORIES.map((item) => {
            const active = item.value === category;
            const href =
              item.value === "all" ? "/works" : `/works?category=${encodeURIComponent(item.value)}`;
            return (
              <Link
                key={item.value}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-pill px-4 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-on"
                    : "bg-surface-warm text-fg-2 hover:bg-border-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {items.length === 0 ? (
          <EmptyState
            icon="NoImage"
            title="这个分类下还没有公开作品"
            description="换一个分类看看，或者去首页浏览精选作品。"
            action={
              <Link href="/works" className="btn btn-primary">
                查看全部作品
              </Link>
            }
          />
        ) : (
          <>
            <p className="font-mono text-xs tracking-caps text-meta">
              共 {total} 件 · 第 {page} 页
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            <Pagination
              page={page}
              limit={PAGE_SIZE.works}
              total={total}
              basePath="/works"
              query={{ category }}
            />
          </>
        )}
      </div>
    </div>
  );
}
