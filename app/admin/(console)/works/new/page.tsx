import Link from "next/link";
import { ProjectForm } from "@/components/admin/project-form";
import { SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

export const metadata = { title: "新建作品" };

export default function NewWorkPage() {
  return (
    <div className="flex max-w-[880px] flex-col gap-8">
      <Link href="/admin/works" className="flex items-center gap-1 text-sm text-muted hover:text-fg">
        <Icon.ChevronLeft size={16} aria-hidden="true" />
        返回作品列表
      </Link>
      <SectionHeading eyebrow="New Work" title="新建作品" />
      <ProjectForm />
    </div>
  );
}
