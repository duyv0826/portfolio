import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { getRepo } from "@/lib/repo-factory";

interface EditWorkProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "编辑作品" };

export default async function EditWorkPage({ params }: EditWorkProps) {
  const { id } = await params;
  const repo = await getRepo();
  const project = await repo.adminGetProject(id);
  if (!project) notFound();

  return (
    <div className="flex max-w-[880px] flex-col gap-8">
      <Link href="/admin/works" className="flex items-center gap-1 text-sm text-muted hover:text-fg">
        <Icon.ChevronLeft size={16} aria-hidden="true" />
        返回作品列表
      </Link>
      <SectionHeading eyebrow="Edit Work" title={project.title} description={`/${project.slug}`} />
      <ProjectForm project={project} />
    </div>
  );
}
