import { ok, notFound, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";

/** GET /api/posts/{slug} —— 博客详情（仅 published，草稿返回 404 而非 403，避免枚举探测） */
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    const repo = await getRepo();
    const post = await repo.getPostBySlug(slug);
    if (!post) return notFound("文章不存在");
    return ok(post);
  } catch (error) {
    console.error("[posts/slug] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
