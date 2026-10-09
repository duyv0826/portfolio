import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { SectionHeading } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icons";
import { getRepo } from "@/lib/repo-factory";

interface EditPostProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "编辑文章" };

export default async function EditPostPage({ params }: EditPostProps) {
  const { id } = await params;
  const repo = await getRepo();
  const post = await repo.adminGetPost(id);
  if (!post) notFound();

  return (
    <div className="flex max-w-[880px] flex-col gap-8">
      <Link href="/admin/posts" className="flex items-center gap-1 text-sm text-muted hover:text-fg">
        <Icon.ChevronLeft size={16} aria-hidden="true" />
        返回文章列表
      </Link>
      <SectionHeading eyebrow="Edit Post" title={post.title} description={`/${post.slug}`} />
      <PostForm post={post} />
    </div>
  );
}
