import Link from "next/link";
import { getRepo } from "@/lib/repo-factory";
import { RowActions } from "@/components/admin/row-actions";
import { Badge, EmptyState, SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/site-config";

interface WorksAdminProps {
  searchParams: Promise<{ page?: string }>;
}

/** 后台作品列表（DESIGN.md §10.10）：操作栏 + 数据表 + 状态 Badge */
export default async function AdminWorksPage({ searchParams }: WorksAdminProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const repo = await getRepo();
  const { items, total } = await repo.adminListProjects({ page, limit: PAGE_SIZE.admin });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Works" title="作品" description={`共 ${total} 件。`} />
        <Link href="/admin/works/new" className="btn btn-primary">
          <Icon.Plus size={20} aria-hidden="true" />
          新建作品
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="NoImage"
            title="还没有作品"
            description="创建第一个作品：填写标题、slug、封面与正文即可发布到前台。"
            action={
              <Link href="/admin/works/new" className="btn btn-primary">
                创建第一个作品
              </Link>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* 桌面表格 */}
          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border">
                  <th scope="col" className="px-5 py-3 text-xs tracking-caps text-muted uppercase">
                    标题
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs tracking-caps text-muted uppercase">
                    分类
                  </th>
                  <th scope="col" className="px-5 py-3 text-xs tracking-caps text-muted uppercase">
                    年份
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
                {items.map((project) => (
                  <tr key={project.id} className="border-b border-border-soft last:border-0 hover:bg-surface-warm">
                    <td className="max-w-[280px] px-5 py-4">
                      <Link
                        href={`/admin/works/${project.id}/edit`}
                        className="block truncate text-sm text-fg hover:text-accent"
                      >
                        {project.title}
                      </Link>
                      <span className="font-mono text-xs text-meta">{project.slug}</span>
                    </td>
                    <td className="px-5 py-4">
                      {project.category ? <Badge>{project.category}</Badge> : "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-fg-2">{project.year ?? "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-meta">
                      {formatDate(project.updated_at)}
                    </td>
                    <td className="px-5 py-2">
                      <RowActions
                        id={project.id}
                        kind="projects"
                        publicPath={`/works/${project.slug}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 手机：每行一卡 */}
          <div className="divide-y divide-border-soft md:hidden">
            {items.map((project) => (
              <div key={project.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm text-fg">{project.title}</span>
                    <span className="font-mono text-xs text-meta">
                      {project.year ?? "—"} · {formatDate(project.updated_at)}
                    </span>
                  </div>
                  {project.category ? <Badge>{project.category}</Badge> : null}
                </div>
                <RowActions id={project.id} kind="projects" publicPath={`/works/${project.slug}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
