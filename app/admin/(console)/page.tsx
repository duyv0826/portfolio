import Link from "next/link";
import { getRepo } from "@/lib/repo-factory";
import { Icon, type IconName } from "@/components/ui/icons";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";

/** 后台概览（DESIGN.md §10.9）：StatCard + 最近内容 + 快捷操作 */
export default async function AdminDashboardPage() {
  const repo = await getRepo();
  const [stats, projects, comments] = await Promise.all([
    repo.stats(),
    repo.adminListProjects({ page: 1, limit: 5 }),
    repo.adminListComments({ page: 1, limit: 5 }),
  ]);

  const cards: { label: string; value: number; icon: IconName }[] = [
    { label: "作品总数", value: stats.projectCount, icon: "Works" },
    { label: "已发布文章", value: stats.publishedPostCount, icon: "Posts" },
    { label: "草稿", value: stats.draftPostCount, icon: "New" },
    { label: "未读留言", value: stats.unreadCommentCount, icon: "Messages" },
    { label: "订阅者", value: stats.subscriptionCount, icon: "Mail" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1
          className="text-2xl text-fg"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-announce)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          概览
        </h1>
        <p className="text-sm text-muted">站点内容状态概览。</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card) => {
          const Glyph = Icon[card.icon];
          return (
            <div key={card.label} className="card flex flex-col gap-2 p-5">
              <Glyph size={20} className="text-meta" aria-hidden="true" />
              <span
                className="text-2xl text-fg"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--weight-announce)",
                  letterSpacing: "var(--tracking-tight)",
                }}
              >
                {card.value}
              </span>
              <span className="font-mono text-xs tracking-caps text-meta">{card.label}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/works/new" className="btn btn-primary">
          <Icon.Plus size={20} aria-hidden="true" />
          新建作品
        </Link>
        <Link href="/admin/posts/new" className="btn btn-secondary">
          <Icon.New size={20} aria-hidden="true" />
          写新文章
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg text-fg" style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-emphasize)" }}>
            最近作品
          </h2>
          {projects.total === 0 ? (
            <div className="card">
              <EmptyState
                icon="NoImage"
                title="还没有作品"
                description="创建第一个作品，前台首页与作品页会同步显示。"
                action={
                  <Link href="/admin/works/new" className="btn btn-primary">
                    创建第一个作品
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="card divide-y divide-border-soft">
              {projects.items.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/works/${project.id}/edit`}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-warm"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm text-fg">{project.title}</span>
                    <span className="font-mono text-xs text-meta">
                      {formatDate(project.updated_at)}
                    </span>
                  </div>
                  <Icon.Edit size={20} className="shrink-0 text-meta" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg text-fg" style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-emphasize)" }}>
            最近留言
          </h2>
          {comments.total === 0 ? (
            <div className="card">
              <EmptyState
                icon="Messages"
                title="还没有留言"
                description="前台「联系」页提交后会出现在这里。"
              />
            </div>
          ) : (
            <div className="card divide-y divide-border-soft">
              {comments.items.map((comment) => (
                <div key={comment.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm text-fg">
                      {comment.name}
                      {comment.email ? ` · ${comment.email}` : ""}
                    </span>
                    <span className="line-clamp-2 text-sm text-muted">{comment.message}</span>
                  </div>
                  {comment.read_at ? (
                    <Badge tone="neutral">已读</Badge>
                  ) : (
                    <Badge tone="warn">未读</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
