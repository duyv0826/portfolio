import Link from "next/link";
import { getRepo } from "@/lib/repo-factory";
import { RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/site-config";
import type { PostStatus } from "@/lib/types";

interface PostsAdminProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

/** 后台博客列表：全部 / 已发布 / 草稿 三个筛选页 */
export default async function AdminPostsPage({ searchParams }: PostsAdminProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const rawStatus = params.status ?? "all";
  const status: PostStatus | undefined =
    rawStatus === "published" || rawStatus === "draft" ? rawStatus : undefined;

  const repo = await getRepo();
  const { items, total } = await repo.adminListPosts({ page, limit: PAGE_SIZE.admin, status });

  const tabs = [
    { value: "all", label: "全部", href: "/admin/posts" },
    { value: "published", label: "已发布", href: "/admin/posts?status=published" },
    { value: "draft", label: "草稿", href: "/admin/posts?status=draft" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Posts" title="博客" description={`共 ${total} 篇。`} />
        <Link href="/admin/posts/new" className="btn btn-primary">
          <Icon.Plus size={20} aria-hidden="true" />
          写新文章
        </Link>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => {
          const active = rawStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-pill bg-accent px-4 py-2 text-sm text-accent-on"
                  : "rounded-pill bg-surface px-4 py-2 text-sm text-fg-2 hover:bg-surface-warm"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="EmptyDoc"
            title="这个状态下还没有文章"
            description="可以先写一篇草稿，确认没问题再发布。"
            action={
              <Link href="/admin/posts/new" className="btn btn-primary">
                写新文章
              </Link>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border">
                  <th scope="col" className="px-5 py-3 text-xs tracking-caps text-muted uppercase">
                    标题
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs tracking-caps text-muted uppercase">
                    状态
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs tracking-caps text-muted uppercase">
                    发布时间
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs tracking-caps text-muted uppercase">
                    更新时间
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-xs tracking-caps text-muted uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((post) => (
                  <tr key={post.id} className="border-b border-border-soft last:border-0 hover:bg-surface-warm">
                    <td className="max-w-[320px] px-5 py-4">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="block truncate text-sm text-fg hover:text-accent"
                      >
                        {post.title}
                      </Link>
                      <span className="font-mono text-xs text-meta">{post.slug}</span>
                    </td>
                    <td className="px-5 py-4">
                      {post.status === "published" ? (
                        <Badge tone="success">已发布</Badge>
                      ) : (
                        <Badge tone="warn">草稿</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-meta">
                      {formatDate(post.published_at)}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-meta">
                      {formatDate(post.updated_at)}
                    </td>
                    <td className="px-5 py-2">
                      <RowActions
                        id={post.id}
                        kind="posts"
                        publicPath={post.status === "published" ? `/blog/${post.slug}` : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border-soft md:hidden">
            {items.map((post) => (
              <div key={post.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm text-fg">{post.title}</span>
                    <span className="font-mono text-xs text-meta">
                      {formatDate(post.updated_at)}
                    </span>
                  </div>
                  {post.status === "published" ? (
                    <Badge tone="success">已发布</Badge>
                  ) : (
                    <Badge tone="warn">草稿</Badge>
                  )}
                </div>
                <RowActions
                  id={post.id}
                  kind="posts"
                  publicPath={post.status === "published" ? `/blog/${post.slug}` : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
