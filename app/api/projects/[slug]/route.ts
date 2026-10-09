import { ok, notFound, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";

/** GET /api/projects/{slug} —— 作品详情（openapi.yaml） */
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  try {
    const repo = await getRepo();
    const project = await repo.getProjectBySlug(slug);
    if (!project) return notFound("作品不存在");
    return ok(project);
  } catch (error) {
    console.error("[projects/slug] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
