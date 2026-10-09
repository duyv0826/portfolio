import { ok, parsePaging, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import { PAGE_SIZE } from "@/lib/site-config";

/** 后台订阅列表（openapi.yaml /api/admin/subscriptions） */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { page, limit } = parsePaging(url.searchParams, PAGE_SIZE.admin);

  try {
    const repo = await getRepo();
    const data = await repo.adminListSubscriptions({ page, limit });
    return ok(data);
  } catch (error) {
    console.error(
      "[admin/subscriptions] 查询失败：",
      error instanceof Error ? error.message : String(error),
    );
    return serverError();
  }
}
