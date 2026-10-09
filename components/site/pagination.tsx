import Link from "next/link";
import { Icon } from "@/components/ui/icons";

/**
 * 分页（DESIGN.md Edge 状态：超长列表必须分页，禁无限长滚动）。
 * 用 Link 而非 onClick —— 保证可被抓取、可分享、可后退。
 */
export function Pagination({
  page,
  limit,
  total,
  basePath,
  query,
}: {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const buildHref = (target: number) => {
    const params = new URLSearchParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
    });
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const prev = page > 1 ? buildHref(page - 1) : null;
  const next = page < totalPages ? buildHref(page + 1) : null;

  return (
    <nav className="flex items-center justify-between gap-4 pt-8" aria-label="分页">
      {prev ? (
        <Link href={prev} className="btn btn-secondary">
          <Icon.ChevronLeft size={20} aria-hidden="true" />
          上一页
        </Link>
      ) : (
        <span className="btn btn-secondary pointer-events-none opacity-50">
          <Icon.ChevronLeft size={20} aria-hidden="true" />
          上一页
        </span>
      )}

      <span className="font-mono text-xs tracking-caps text-meta">
        {page} / {totalPages}
      </span>

      {next ? (
        <Link href={next} className="btn btn-secondary">
          下一页
          <Icon.ChevronRight size={20} aria-hidden="true" />
        </Link>
      ) : (
        <span className="btn btn-secondary pointer-events-none opacity-50">
          下一页
          <Icon.ChevronRight size={20} aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
