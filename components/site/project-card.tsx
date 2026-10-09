import Image from "next/image";
import Link from "next/link";
import type { ProjectListItem } from "@/lib/types";
import { COPYRIGHT_HOLDER } from "@/lib/site-config";
import { Badge } from "@/components/ui/primitives";

/**
 * 作品卡（DESIGN.md §10.2）。
 * 缩略图统一 4:3 + 懒加载 + 渐显；hover 抬升 + 边框转 accent；
 * 作者 ID「©洪兄」以 mono xs 标注，团队项目显示「个人贡献」标签。
 */
export function ProjectCard({
  project,
  priority = false,
  className,
}: {
  project: ProjectListItem;
  priority?: boolean;
  className?: string;
}) {
  return (
    <article className={className}>
      <Link href={`/works/${project.slug}`} className="group block">
        <div className="card card-hover overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-warm">
            <Image
              src={project.cover_image_url}
              alt={`${project.title} — ${COPYRIGHT_HOLDER}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3
                className="line-clamp-2 text-lg text-fg transition-colors group-hover:text-accent"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--weight-emphasize)",
                  letterSpacing: "var(--tracking-tight)",
                  lineHeight: "var(--leading-snug)",
                }}
              >
                {project.title}
              </h3>
              {project.year && (
                <span className="shrink-0 font-mono text-xs text-meta">{project.year}</span>
              )}
            </div>

            <p className="line-clamp-2 text-sm text-fg-2">{project.summary}</p>

            <div className="flex flex-wrap items-center gap-2">
              {project.role && <Badge>{project.role}</Badge>}
              {project.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border-soft pt-3">
              <span className="font-mono text-xs text-meta">{COPYRIGHT_HOLDER}</span>
              {project.category && (
                <span className="font-mono text-xs tracking-caps text-meta uppercase">
                  {project.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
