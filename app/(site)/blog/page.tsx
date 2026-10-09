import type { Metadata } from "next";
import Link from "next/link";
import { getRepo } from "@/lib/repo-factory";
import { Pagination } from "@/components/site/pagination";
import { Badge, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { PAGE_SIZE } from "@/lib/site-config";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "博客",
  description: "创作笔记：互动叙事、游戏设计、工具链与美术流程的实践记录。",
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

/** 博客列表（DESIGN.md §10.4）：首篇 Featured 大卡 + 后续错落小卡 */
export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const repo = await getRepo();
  const { items, total } = await repo.listPosts({ page, limit: PAGE_SIZE.posts });

  if (items.length === 0) {
    return (
      <div className="section-y">
        <div className="container-page flex flex-col gap-10">
          <SectionHeading eyebrow="Blog" title="博客 / 笔记" description="创作过程与实践记录。" />
          <EmptyState
            icon="EmptyDoc"
            title="还没有发布文章"
            description="文章正在整理。可以先订阅，发布时会第一时间收到。"
            action={
              <Link href="/contact" className="btn btn-primary">
                订阅更新
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const [featured, ...rest] = items;
  const showFeatured = page === 1 && featured;

  return (
    <div className="section-y">
      <div className="container-page flex flex-col gap-10">
        <SectionHeading
          eyebrow="Blog"
          title="博客 / 笔记"
          description="互动叙事、游戏设计、工具链与美术流程的实践记录。"
        />

        {showFeatured && (
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="card card-hover p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {featured.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} tone="accent">
                      {tag}
                    </Badge>
                  ))}
                  <span className="font-mono text-xs text-meta">
                    {formatDate(featured.published_at ?? featured.created_at)}
                  </span>
                </div>
                <h2
                  className="line-clamp-2 text-2xl text-fg transition-colors group-hover:text-accent md:text-3xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: "var(--weight-announce)",
                    letterSpacing: "var(--tracking-display)",
                    lineHeight: "var(--leading-tight)",
                  }}
                >
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="line-clamp-3 max-w-[68ch] text-base text-fg-2">{featured.excerpt}</p>
                )}
                <span className="font-mono text-xs tracking-caps text-accent">阅读全文 →</span>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {(showFeatured ? rest : items).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <article className="card card-hover flex h-full flex-col gap-3 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  {post.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                  <span className="font-mono text-xs text-meta">
                    {formatDate(post.published_at ?? post.created_at)}
                  </span>
                </div>
                <h3
                  className="line-clamp-2 text-lg text-fg transition-colors group-hover:text-accent"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: "var(--weight-emphasize)",
                    letterSpacing: "var(--tracking-tight)",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="line-clamp-2 text-sm text-fg-2">{post.excerpt}</p>
                )}
              </article>
            </Link>
          ))}
        </div>

        <Pagination page={page} limit={PAGE_SIZE.posts} total={total} basePath="/blog" />
      </div>
    </div>
  );
}
