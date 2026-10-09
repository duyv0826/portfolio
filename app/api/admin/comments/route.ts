import { ok, parsePaging, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import { PAGE_SIZE } from "@/lib/site-config";

/** 后台留言列表（openapi.yaml /api/admin/comments） */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePaging(url.searchParams, PAGE_SIZE.admin);

  try {
    const repo = await getRepo();
    const data = await repo.adminListComments({ page, limit });
    return ok(data);
  } catch (error) {
    console.error("[admin/comments] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
