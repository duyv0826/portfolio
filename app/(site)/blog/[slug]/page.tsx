import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepo } from "@/lib/repo-factory";
import { MarkdownView } from "@/components/site/markdown-view";
import { Badge } from "@/components/ui/primitives";
import { SITE } from "@/lib/site-config";
import { formatDate, readingMinutes } from "@/lib/format";
import { Icon } from "@/components/ui/icons";

interface PostDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepo();
  const post = await repo.getPostBySlug(slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.excerpt ?? SITE.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.published_at ?? undefined,
    },
  };
}

/** 博客详情（DESIGN.md §10.5）：窄栏标题 + 720px 阅读列 + 文末作者卡 */
export default async function PostDetailPage({ params }: PostDetailProps) {
  const { slug } = await params;
  const repo = await getRepo();
  const post = await repo.getPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingMinutes(post.content_md);

  return (
    <article className="section-y">
      <div className="container-page flex flex-col items-center gap-10">
        <header className="flex w-full max-w-[720px] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {post.tags?.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            <span className="font-mono text-xs text-meta">
              {formatDate(post.published_at ?? post.created_at)}
            </span>
            <span className="font-mono text-xs text-meta">约 {minutes} 分钟</span>
          </div>
          <h1
            className="text-2xl text-fg md:text-3xl"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-announce)",
              letterSpacing: "var(--tracking-display)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            {post.title}
          </h1>
          {post.excerpt && <p className="text-lg text-fg-2">{post.excerpt}</p>}
        </header>

        <div className="w-full max-w-[720px]">
          <MarkdownView content={post.content_md} />
        </div>

        {/* 文末作者卡 */}
        <aside className="card flex w-full max-w-[720px] flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <Icon.User size={24} className="text-meta" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p
                className="text-base text-fg"
                style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-emphasize)" }}
              >
                {SITE.name}
              </p>
              <p className="text-sm text-muted">{SITE.tagline}</p>
            </div>
          </div>
          <Link href="/contact" className="btn btn-primary">
            交流或订阅
            <Icon.ArrowRight size={20} aria-hidden="true" />
          </Link>
        </aside>

        <Link href="/blog" className="self-start text-sm text-muted hover:text-fg">
          ← 返回博客列表
        </Link>
      </div>
    </article>
  );
}
