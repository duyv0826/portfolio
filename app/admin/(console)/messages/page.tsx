import { getRepo } from "@/lib/repo-factory";
import { MessageActions } from "@/components/admin/message-actions";
import { Badge, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { PAGE_SIZE } from "@/lib/site-config";
import { formatDate } from "@/lib/format";

interface MessagesAdminProps {
  searchParams: Promise<{ page?: string }>;
}

/** 后台留言管理（DESIGN.md §10.10） */
export default async function AdminMessagesPage({ searchParams }: MessagesAdminProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const repo = await getRepo();
  const { items, total } = await repo.adminListComments({ page, limit: PAGE_SIZE.admin });

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading eyebrow="Messages" title="留言" description={`共 ${total} 条。`} />

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="Messages"
            title="还没有留言"
            description="前台「联系」页提交后会出现在这里，并附带明示同意时间。"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((comment) => (
            <article key={comment.id} className="card flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-base text-fg" style={{ fontWeight: "var(--weight-emphasize)" }}>
                    {comment.name}
                  </p>
                  <p className="font-mono text-xs text-meta">{comment.email}</p>
                </div>
                {comment.read_at ? (
                  <Badge tone="neutral">已读</Badge>
                ) : (
                  <Badge tone="warn">未读</Badge>
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm text-fg-2">{comment.message}</p>

              <dl className="flex flex-wrap gap-x-8 gap-y-2 border-t border-border-soft pt-4">
                <div className="flex items-center gap-2">
                  <dt className="font-mono text-xs tracking-caps text-meta uppercase">提交时间</dt>
                  <dd className="font-mono text-xs text-fg-2">{formatDate(comment.created_at)}</dd>
                </div>
                {comment.consent_at && (
                  <div className="flex items-center gap-2">
                    <dt className="font-mono text-xs tracking-caps text-meta uppercase">同意时间</dt>
                    <dd className="font-mono text-xs text-fg-2">
                      {formatDate(comment.consent_at)}
                    </dd>
                  </div>
                )}
              </dl>

              <MessageActions id={comment.id} read={Boolean(comment.read_at)} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
