import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, ok, serverError } from "@/lib/api";
import { getRepo } from "@/lib/repo-factory";
import { PAGE_SIZE } from "@/lib/site-config";

/** GET /api/posts —— 已发布博客列表（仅公开 published，草稿不会泄漏） */
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(PAGE_SIZE.posts),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "查询参数不合法");
  }

  try {
    const repo = await getRepo();
    const data = await repo.listPosts({ page: parsed.data.page, limit: parsed.data.limit });
    return NextResponse.json(
      { code: 0, message: "", data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("[posts] 查询失败：", error instanceof Error ? error.message : String(error));
    return serverError();
  }
}
