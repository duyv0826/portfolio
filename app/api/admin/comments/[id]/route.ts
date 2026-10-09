import { notFound, ok, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";

type RouteContext = { params: Promise<{ id: string }> };

/** 后台留言：标记已读 / 软删除 */
export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const repo = await getRepo();
    const updated = await repo.markCommentRead(id);
    if (!updated) return notFound("留言不存在");
    return ok({ id });
  } catch (error) {
    console.error("[admin/comment] 标记失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const repo = await getRepo();
    const removed = await repo.deleteComment(id);
    if (!removed) return notFound("留言不存在");
    return ok({ id });
  } catch (error) {
    console.error("[admin/comment] 删除失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
