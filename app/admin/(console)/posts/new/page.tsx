import Link from "next/link";
import { PostForm } from "@/components/admin/post-form";
import { SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";

export const metadata = { title: "写新文章" };

export default function NewPostPage() {
  return (
    <div className="flex max-w-[880px] flex-col gap-8">
      <Link href="/admin/posts" className="flex items-center gap-1 text-sm text-muted hover:text-fg">
        <Icon.ChevronLeft size={16} aria-hidden="true" />
        返回文章列表
      </Link>
      <SectionHeading eyebrow="New Post" title="写新文章" description="默认存为草稿，确认后再发布。" />
      <PostForm />
    </div>
  );
}
